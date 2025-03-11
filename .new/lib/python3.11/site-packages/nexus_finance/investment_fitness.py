# Copyright (C) 2025 Henrik Lorenzen <your_email@nxs.solutions>
#
# Nexus-Finance is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# Nexus-Finance is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with Nexus-Finance. If not, see <http://www.gnu.org/licenses/>.

import math


class InvestmentPlanFitness:
    weights = {"scale": 1,
               "user": 1,
               "growth": 1,
               "invest": 10,
               "reinvest": 2,
               "revenue": 2,
               }

    def __init__(self, user_base, strategy, **weights):
        self.user_base = user_base
        self.strategy = strategy
        self.weights = self.weights.copy()
        self.weights.update(weights)

    def eval(self, individual, verbose=False, **weights):
        eval_weights = self.weights.copy()
        eval_weights.update(weights)
        user_base = self.user_base.simulate_growth(individual, days=self.strategy["target_day"])
        total_cost, total_user = user_base.total_cost(), len(user_base)
        reinvest_rates = list(map(lambda v: v["reinvestment_rate"], filter(lambda v: 1 >= v["reinvestment_rate"] > 0, individual.values())))
        mean_reinvest_rate = sum(reinvest_rates)/(1 if not reinvest_rates else len(reinvest_rates))
        target_user, target_day = self.strategy["target_user"], self.strategy["target_day"]
        total_revenue = user_base.total_revenue()
        
        user_reached = self.user_reached(total_user, 
                                         target_user, 
                                         weight=eval_weights.get("user", 1))

        growth_eff = self.growth_efficency(user_base.daily_total_user(), 
                                           target_user, 
                                           target_day,
                                           weight=eval_weights.get("growth", 1))
        
        cost_eff = self.cost_efficency(total_user, 
                                       total_cost, 
                                       total_revenue, 
                                       mean_reinvest_rate, 
                                       invest_weight=eval_weights.get("invest", 10), 
                                       reinvest_weight=eval_weights.get("reinvest", 2), 
                                       revenue_weight=eval_weights.get("revenue", 2)) 
        
        penalty = user_reached + cost_eff + growth_eff 
        penalty = penalty ** eval_weights.get("scale", 1)

        if verbose:
            print(f"weights: {eval_weights}\n user: {user_reached}\n growth: {growth_eff}\n cost: {cost_eff}\n penalty:{penalty}") 

        return (penalty, )
 
    @staticmethod
    def user_reached(num_user, num_target, weight=1):
        if num_user == 0:
            num_user = math.inf
            return math.inf

        val = abs(num_target - num_user)
        return 0 if val == 0 else abs(math.log(val * weight))
        
    @staticmethod
    def growth_efficency(daily_total_usr, target_usr, target_day, weight=1):
        def merged_result(item):
            active, target = item
            user_diff = abs(active - target) * weight
            return 0 if user_diff == 0 else math.log(user_diff) * (1.2 if active > target else .8)

        daily_growth = target_usr/target_day
        daily_targets = map(lambda i: daily_growth * i, range(1, target_day + 1))
        merged = list(zip(daily_total_usr, daily_targets))
        daily_diff = list(map(merged_result, merged))
        mean = sum(daily_diff)/target_day
        return abs(mean)

    @staticmethod
    def invest_efficency(num_user, cost, weight=10): 
        cost = math.log(cost)
        num_user = 1 if num_user == 0 else math.log(num_user)
        val = cost/num_user 
        return val
    
    @staticmethod
    def reinvest_efficency(revenue, reinvest_rate, revenue_weight=2, reinvest_weight=2):
        revenue = 1 if revenue == 0 else abs(math.log(revenue))
        revenue = 1/revenue*revenue_weight
        reinvest_rate = 1 + reinvest_rate * reinvest_weight
        return revenue*reinvest_rate

    @classmethod
    def cost_efficency(cls, 
                       total_user, 
                       total_cost, 
                       total_revenue, 
                       mean_reinvest_rate, 
                       invest_weight=10, 
                       reinvest_weight=2, 
                       revenue_weight=2):
        
        invest_eff = cls.invest_efficency(total_user, total_cost, weight=invest_weight)
        reinvest_eff = cls.reinvest_efficency(total_revenue, mean_reinvest_rate, revenue_weight=revenue_weight, reinvest_weight=reinvest_weight)
        return invest_eff * reinvest_eff 

    @staticmethod
    def install_efficency(num_target, total_installed):
        num_target = num_target if num_target != 0 else 1
        eff = total_installed/num_target
        return eff

    @staticmethod
    def user_fluctuation(max_user, num_user):
        fluct = max_user - num_user
        return 1 if fluct not in (0, 1) else math.log(abs(fluct))



if __name__ == "__main__":
    from user_base import UserBase
    types = [{"conversion_rate": .05, "max_days_of_activity": math.inf, "daily_hours": .05}]
    user_base = UserBase(0, *types)
    strategy =  {"initial_invest": (1000, 50000), 
                 "reinvest_rate" : (0.1, 0.2),
                 "revenue_per_h" : .18,
                 "cost_per_install": 2.0,
                 "target_day" : 4, 
                 "target_user": 100, 
                 "invest_days": (0, 1),
                 "reinvest_days": (0, 3), 
                 "num_extra_invest": (0, 24),
                 "num_reinvest": (0, 24),
                 "extra_invest": (1000, 100000),
                 "extra_invest_days": (0, 3),
                 }
 

    individual = { 0: {"investment": 1000, "reinvestment_rate": 0}}
    individual_2 = {**individual, 1: {"investment": 1000, "reinvestment_rate": 0}, 2: {"investment": 1000, "reinvestment_rate": 0}, 3: {"investment": 1000, "reinvestment_rate": 0.}}
    individual_3 = {**individual, 1: {"investment": 2500, "reinvestment_rate": .2}, 2: {"investment": 0, "reinvestment_rate": .1}}
    fitness = InvestmentPlanFitness(user_base, strategy, user=1, scale=1, growth=1, reinvest=1, invest=1, revenue=1)
    print(fitness.eval(individual_2), fitness.eval(individual_3))





