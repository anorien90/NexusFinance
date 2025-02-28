import math
import numpy as np
import plotly.graph_objects as go
import dash
from dash import dcc, html
from dash.dependencies import Input, Output
from deap import base, creator, tools, algorithms
import random
import math
import matplotlib.pyplot as plt


price_of_power = .29

class User:

    def __init__(self, 
                 cost_per_install=2.0,
                 conversion_rate=2,
                 hours_per_day=.25,
                 max_days_of_activity=30
                 ):
        self.days_of_activity = 0
        self.max_days_of_activity = max_days_of_activity
        self.cost_per_install = cost_per_install
        self.conversion_rate = conversion_rate or self.conversion_rate
        self.hours_per_day = lambda day: hours_per_day * min(self.max_days_of_activity, day)

    def hours_per_month(self, months):
        if type(months) in (int, float):
            return self.hours_per_day(365/12) * months
        elif type(months) in (list, tuple, iter):
            return self.hours_per_day(sum(months))
        else:
            raise ValueError(f"{months} must be an iterable or number")

    def hours_per_year(self, years):
        if type(years) in (int, float):
            return self.hours_per_day(365) * years 
        elif type(years) in (list, tuple, iter):
            return self.hours_per_day(sum(years))
        else:
            raise ValueError(f"{years} must be an iterable or number")

    def hours(self, time, scale="month"):
        try:
            key = f"hours_per_{scale}"
            return getattr(self, key)(time)
        except AttributeError:
            raise KeyError(f"{scale} is not a legal scale.")

    @staticmethod
    def revenue_per_hour(hours, price=.18):
        return hours * price

    def revenue_per_day(self, days, price=.18):
        days = min(days, self.max_days_of_activity)
        return self.revenue_per_hour(self.hours_per_day(1), price) * days

    def revenue_per_month(self, months, price=.18):
        if type(months) in (int, float):
            return self.revenue_per_day(30.5 * months, price) 
        elif type(months) in (list, tuple, iter):
            return self.revenue_per_day(sum(months))
    
    def revenue_per_year(self, years, price=.18):
        if type(years) in (int, float):
            return self.revenue_per_day(365 * years, price) 
        elif type(years) in (list, tuple, iter):
            return self.revenue_per_day(sum(years), price)
    
    def revenue(self, time, scale="month"):
        key = f"revenue_per_{scale}"
        try:
            return getattr(self, key)(time)
        except AttributeError as e:
            raise e

    @property
    def cost(self):
        return self.cost_per_install * 1/self.conversion_rate

    
    def copy(self):
        return type(self)(cost_per_install=self.cost_per_install,
                          conversion_rate=self.conversion_rate,
                          max_days_of_activity=self.max_days_of_activity,
                          hours_per_day=self.hours_per_day(1),
                          )



class InvestmentStrategy:
 
    def __init__(self, user_base) -> None:
        self.user_base = user_base
        self.cost_per_install = 2.0
        self.total_installed = 0
        self.total_cost = 0
        self.initial_investment = (1000, 50000)
        self.additional_investment = (1000, 50000)
        self.num_reinvestments = (1, 12)
        self.reinvestment_rate = (0.1, 0.9)
        self.reinvestment_days = (1, 365)
        self.target_user = 10000
        self.target_day = 365
        self.creator = creator
        self.base = base
        self.toolbox = self.base.Toolbox()
        self.setup_toolbox()

    @property
    def min_invest(self):
        return self.initial_investment[0]

    @property
    def max_invest(self):
        return self.initial_investment[1]

    @property
    def min_reinvest(self):
        return self.reinvestment_rate[0]

    @property
    def max_reinvest(self):
        return self.reinvestment_rate[1]


    def setup_toolbox(self):
        if not hasattr(self.creator, "Individual"):
            self.creator.create("FitnessMin", self.base.Fitness, weights=(-1.0,))
            self.creator.create("Individual", list, fitness=self.creator.FitnessMin)

        self.toolbox.register("attr_investment", random.randint, *self.initial_investment)  # Initial investment
        self.toolbox.register("attr_reinvest", random.uniform, *self.reinvestment_rate)  # Reinvestment rate
        self.toolbox.register("attr_day", random.randint, *self.reinvestment_days)  # Marketing boost days
        self.toolbox.register("attr_amount", random.randint, *self.additional_investment)  # Boost investment amount
        self.toolbox.register("attr_num_reinvest", random.randint, *self.num_reinvestments)

        def init_individual():
            num_reinvestments = self.toolbox.attr_num_reinvest()
            individual = [self.toolbox.attr_investment(), self.toolbox.attr_reinvest()]
            for _ in range(num_reinvestments):
                individual.append(self.toolbox.attr_day())
                individual.append(self.toolbox.attr_amount())
            return creator.Individual(individual)

        self.toolbox.register("individual", init_individual)
        self.toolbox.register("population", tools.initRepeat, list, self.toolbox.individual)
        self.toolbox.register("evaluate", self.eval_strategy)
        self.toolbox.register("mate", tools.cxTwoPoint)
        self.toolbox.register("mutate", tools.mutGaussian, mu=0, sigma=1000, indpb=0.2)
        self.toolbox.register("select", tools.selTournament, tournsize=3)


    def eval_strategy(self, individual, target_user=10000):
        """ Evaluates the fitness of an investment schedule. """
        investment_plan = {"initial_invest": int(individual[0]),  # First element is initial investment
                           "reinvest_rate": individual[1],  # Second element is reinvestment percentage
                           "schedule": {int(day): int(amount) for day, amount in zip(individual[2::2], individual[3::2])},
                           "target_user": self.target_user,
                           "days": self.target_day}
                            
        user_base = self.user_base.copy()    
        final_users = self.eval_growth(user_base, investment_plan)
        total_cost = sum(investment_plan["schedule"].values()) + investment_plan["initial_invest"]
        penalty = abs(final_users - self.target_user) ** 4 + total_cost * 0.1 - investment_plan["reinvest_rate"] * 100
        return (penalty,)

 
    def eval_growth(self, user_base_copy, investment_plan):
        user_base = user_base_copy.simulate_growth(investment_plan)
        return len(user_base)  # Return the final number of active users


    def plot_dashboard(self, investment_plan, debug=True):
        user_base = self.user_base.simulate_growth(investment_plan)
        days = list(range(len(user_base.days)))
        app = dash.Dash(__name__)
        app.layout = html.Div([
            html.H1("Investment Strategy Dashboard"),
            html.H2("Active User"),
            html.B(f"Final User: {len(user_base)}"),
            dcc.Graph(id='user-growth',
                      figure={
                          'data': [go.Scatter(x=days, y=user_base.daily_total_user, mode='lines', name='Active Users')],
                          'layout': {'title': 'User Growth Over Time'}
                      }),
            html.H2("Advertisement"),
            html.B(f"Total Cost: {'{:,}'.format(int(user_base.total_cost)).replace(',', '.')} €"),
            html.Br(),
            html.B(f"Reinvestment_rate: {round(investment_plan['reinvest_rate'], 2)}"),
            dcc.Graph(id='total-costs',
                      figure={
                          'data': [
                                go.Scatter(x=days, y=user_base.daily_total_costs, mode='lines', name='Total Cost'),
                                go.Scatter(x=days, y=user_base.daily_total_reinvest, mode='lines', name='Total Reinvested')
                          ],
                          'layout': {'title': 'Financial Metrics Over Time'}
                      }),
            html.H3("Daily Revenue"),
            dcc.Graph(id='daily-revenue',
                      figure={
                          'data': [
                                go.Scatter(x=days, y=user_base.daily_reinvest, mode='lines', name='Daily Reinvest'),
                                go.Scatter(x=days, y=user_base.daily_total_revenue, mode='lines', name='Daily Total Revenue'),
                          ],
                          'layout': {'title': 'Financial Metrics Over Time'}
                      })
 
        ])
        app.run_server(debug=debug)


    def plot_growth(self, investment_plan):
        user_base = self.user_base.simulate_growth(investment_plan)
        fig, axes = plt.subplots(3, 1, figsize=(10, 8))

        days = range(len(user_base.days))

        # Plot User Growth
        axes[0].plot(days, user_base.daily_total_user, 
                     label='Active Users', color='blue')
        axes[0].set_title('User Growth Over Time')
        axes[0].set_xlabel('Days')
        axes[0].set_ylabel('User')
        axes[0].legend()
        
        # Plot Financial Metrics
        axes[1].plot(days, user_base.daily_total_costs, label='Total Cost', color='red')
        axes[1].plot(days, user_base.daily_total_reinvest, label='Total Reinvested', color='blue')
        # axes[1].set_title('Financial Metrics Over Time')
        axes[1].set_xlabel('Days')
        axes[1].set_ylabel('Euro')
        axes[1].legend()
        
        # # y = np.vstack([daily_revenue, reinvested_revenue])
        # # axes[2].stackplot(range(1, investment_plan["days"] + 1), y)

        axes[2].plot(days, user_base.daily_total_revenue, label='Daily Total Revenue', color='green')
        axes[2].plot(days, user_base.daily_reinvest, label='Daily Reinvest', color='orange')
        axes[2].set_xlabel('Days')
        axes[2].set_ylabel('Euro')
        axes[2].legend()

        # axes[1].plot(days, total_revenue, label='Total Revenue', color='green')
        # axes[3].plot(days, user_base.daily_reinvest, label='Reinvested Revenue', color='blue')
        # axes[3].plot(days, user_base.daily_revenue, label='Daily Revenue', color='green')
        
        plt.tight_layout()
        plt.show()
     
    def optimize(self, population=50, generations=20, mutprob=0.2):
        pop = self.toolbox.population(n=population)
        algorithms.eaSimple(pop, self.toolbox, cxpb=0.5, mutpb=mutprob, ngen=generations, verbose=True)
        best_individual = tools.selBest(pop, k=1)[0]
        num_reinvestments = (len(best_individual) - 2) // 2
        best_investment_plan = {best_individual[i * 2 + 2]: best_individual[i * 2 + 3] for i in range(num_reinvestments)}

        return {
            "initial_invest": best_individual[0],
            "reinvest_rate": best_individual[1],
            "schedule": best_investment_plan,
            "days": self.target_day,
        }


class UserBase:

    def __init__(self, num_user, *user) -> None:
        self.user_types = list(user)
        self.user = []
        self.day = 0
        self.cost_per_install = 2.0
        self.total_installed = 0
        self.days = [{"total_revenue": 0,
                      "total_reinvest": 0,
                      "total_installed": self.total_installed,
                      "total_cost": 0,
                      "total_user": 0,
                      "daily_cost": 0,
                      "daily_revenue": 0,
                      "daily_reinvest": 0,
                    }]
        self.add(num_user)
        if self.conversion_rate > 1:
            raise ValueError("Total conversion_rate can't be more than 100%")
        

    def add(self, num_user, *user_types, reinvest=False, cost_per_install=2.0):
        user = user_types or self.user_types
        self.total_installed += num_user
        if not reinvest:
            daily_cost = num_user * cost_per_install
            self.days[-1]["daily_cost"] = daily_cost
            self.days[-1]["total_cost"] = self.total_cost
        
        else:
            reinvest = num_user * cost_per_install
            # self.total_reinvest += reinvest
            self.days[-1]["daily_reinvest"] = reinvest
            self.days[-1]["daily_revenue"] -= reinvest

        for user_type in user:
            for _ in range(int(user_type.conversion_rate * num_user)):
                user = user_type.copy()
                self.user.append(user)

        self.days[-1]["total_user"] = len(self)

    @property
    def total_revenue(self):
        return sum(map(lambda d: d["daily_revenue"], self.days))

    @property
    def total_reinvest(self):
        return sum(map(lambda d: d["daily_reinvest"], self.days))
    
    @property
    def total_cost(self):
        return sum(map(lambda d: d["daily_cost"], self.days))

    @property
    def daily_total_user(self):
        return list(map(lambda d: d["total_user"], self.days))
    
    @property
    def daily_total_revenue(self):
        return list(map(lambda d: d["total_revenue"], self.days))
        
    @property
    def daily_total_reinvest(self):
        return list(map(lambda d: d["total_reinvest"], self.days))

    @property
    def daily_total_costs(self):
        return list(map(lambda d: d["total_cost"], self.days))

    @property
    def daily_revenue(self):
        return list(map(lambda d: d["daily_revenue"], self.days))

    @property
    def daily_reinvest(self):
        return list(map(lambda d: d["daily_reinvest"], self.days))

    @property
    def daily_cost(self):
        return list(map(lambda d: d["daily_cost"], self.days))


    def get(self, **kwargs):
        def fltrd_user(user, **kw):
            if user.days_of_activity > user.max_days_of_activity:
                yield False

            else:
                for k, v in kw.items():
                    try:
                        yield v(getattr(user, k))
                    except Exception:
                        yield getattr(user, k) == v

        return filter(lambda user: all(fltrd_user(user, **kwargs)), self.user)

    def hours(self, time, scale="month"):
        return sum((user.hours(time, scale) for user in self.get()))

    def revenue(self, time, scale="month"):
        return sum(user.revenue(time, scale) for user in self.get())

    def __len__(self):
        return len(self.user)
    
    def next(self, num=1, verbose=True, print_step=2):
        for i in range(num):
            user = list(self.get())
            daily_revenue = sum(usr.revenue_per_day(1) for usr in user)
            for usr in user:
                usr.days_of_activity += 1
            self.user = user
            self.day += 1 
            self.days.append({"total_cost": self.total_cost,
                              "total_revenue": self.total_revenue,
                              "total_reinvest": self.total_reinvest,
                              "total_user": len(self),
                              "daily_revenue": daily_revenue,
                              "daily_cost": 0,
                              "daily_reinvest": 0})
            if i % print_step == 0 and verbose:
                print(f"year: {int(self.day/365)+1} day: {self.day - (int(self.day/365) * 365)}")
                print("active_user", len(self))
                print("total_revenue", self.total_revenue)
                print("total_cost:", self.total_cost)

    @property
    def conversion_rate(self):
        return sum(usr.conversion_rate for usr in self.user_types)

    @property
    def conversion_mean(self):
        return sum(usr.conversion_rate for usr in self.user_types)/len(self.user_types)

    @property
    def effective_cost(self):
        return 1/self.conversion_rate * self.cost_per_install

    def copy(self):
        new_user_base = UserBase(0, *self.user_types)  # Create a new instance with the same user types
        new_user_base.user = [user.copy() for user in self.user]  # Copy all users
        new_user_base.day = self.day
        new_user_base.days = self.days.copy()
        new_user_base.cost_per_install = self.cost_per_install
        new_user_base.total_installed = self.total_installed
        return new_user_base

    def simulate_growth(self, investment_plan, verbose=False):
        user_base_copy = self.copy()
        user_base_copy.add(investment_plan["initial_invest"]/self.cost_per_install)
        for day in range(1, investment_plan["days"] + 1):
            user_base_copy.next(1, verbose=verbose)
            reinvest_users = int((user_base_copy.total_revenue * investment_plan["reinvest_rate"]) / user_base_copy.cost_per_install)
            if reinvest_users > 0:
                user_base_copy.add(reinvest_users, reinvest=True)
    
            if day in investment_plan["schedule"]:
                user_base_copy.add(investment_plan["schedule"][day]/self.cost_per_install)
    
        return user_base_copy




if __name__ == "__main__":
    user_base = UserBase(0,
                         User(conversion_rate=.0475,
                              hours_per_day=.3,
                              max_days_of_activity=1),
                         User(conversion_rate=.1, 
                              hours_per_day=.25,
                              max_days_of_activity=30),
                         User(conversion_rate=.05, 
                              hours_per_day=.75, 
                              max_days_of_activity=math.inf))
    

    plan = InvestmentStrategy(user_base)
    # investment_plan = plan.optimize(population=50, generations=20)

    investment_plan = {'initial_invest': 11303, 'reinvest_rate': 0.7021442708847124, 'schedule': {274: 14316, 40: 11051, 96: 7194.073550520047, 198: 37829, 339: 8737, 124: 28013.973147288176}, 'days': 365}    
    # investment_plan = {'initial_invest': 37845, 'reinvest_rate': 0.7205107304313165, 'schedule': {320: 14047.779032239763, 277: 14190}, 'days': 365}
    # investment_plan = {'initial_invest': 7019.884772903768, 'reinvest_rate': 0.6857537946620936, 'schedule': {161: 42889, 8: 19079, 89: 24461, 108: 27731.77597058955}, 'days': 365}     
    # investment_plan = {'initial_invest': 37629, 'reinvest_rate': 0.43616933407049685, 'schedule': {143: 31871.91311629372, 264: 13399.763926979944, 3354.135858385042: 273.31023152837065, 148: 33679, 218: 9868}, 'days': 365}
    # investment_plan = {'initial_invest': 41023, 'reinvest_rate': 0.45496808954827417, 'schedule': {36: 30959, 26: 17371.899469183812, 258: 5522.109082590796}, 'days': 365}

    print("investment_plan", investment_plan,)
    # plan.plot_growth(investment_plan)
    plan.plot_dashboard(investment_plan, debug=False)
    # new_base = user_base.simulate_growth(investment_plan, verbose=False)
    # print(f"active user: {len(new_base)}\ntotal_revenue: {new_base.total_revenue}\ntotal_cost: {new_base.total_cost}")
