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

import json
import math
from .user_type import User
import random


class UserBase:
    _temp = [] # storage of generated UserBases during runtime and simulation. Should be cleaned after optimizing. 


    def __init__(self, 
                num_user:int, # Number of total initial users to start with. 
                              # Note: 1000 means you get 1000/100 * conversion_raten per user_type users.
                              # Init with 0 to start with an empty UserBase.  
                *user_types, 
                day: int=0, 
                user=[], 
                days=[],
                total_installed=0,
                cost_per_install=2.0,
                price_per_hour=.18,
                **kwargs) -> None:
        self._types = []
        self.cost_per_install = cost_per_install
        self.price_per_hour = price_per_hour
        self.types = user_types
        self.user = user.copy()
        self.day = day
        self.total_installed = total_installed
        self.days = days.copy()

        if num_user > 0:
            self.add(num_user)

    @property
    def types(self):
        return self._types

    @types.setter
    def types(self, usr_types):
        assert type(usr_types) in (tuple, list, iter)
        self._types = []  
        for usr_type in usr_types:
            if type(usr_type) == dict:
                usr_type = User(**usr_type)
        
            self._types.append(usr_type)

    def add(self, num_user, *user_types, reinvest=False, cost_per_install=None):
        user = user_types or self.types
        cost_per_install = cost_per_install or self.cost_per_install
        self.total_installed += num_user
        
        if len(self.days) == 0:
            self.days.append(self.today())
        self.days[-1]["total_installed"] = self.total_installed

        if not reinvest:
            daily_cost = num_user * cost_per_install
            self.days[-1]["daily_cost"] = daily_cost
            self.days[-1]["total_cost"] = self.total_cost()
        
        else:
            reinvest = num_user * cost_per_install
            self.days[-1]["daily_reinvest"] = reinvest
            self.days[-1]["daily_revenue"] = - reinvest
            self.days[-1]["total_revenue"] = self.total_revenue()

        for user_type in user:
            for _ in range(int(user_type.conversion_rate * num_user)):
                user = user_type.copy()
                self.user.append(user)

        self.days[-1]["total_user"] = len(self)

    def max_active_user(self):
        return max(self.daily_total_user())

    def total_revenue(self):
        return sum(self.daily_revenue())

    def total_reinvest(self):
        return sum(self.daily_reinvest())
    
    def total_cost(self):
        return sum(self.daily_cost())

    def return_of_invest(self):
        return self.total_cost() - self.total_revenue()

    def daily_total_user(self):
        return list(map(lambda d: d["total_user"], self.days))
    
    def daily_total_revenue(self):
        return list(map(lambda d: d["total_revenue"], self.days))
        
    def daily_total_reinvest(self):
        return list(map(lambda d: d["total_reinvest"], self.days))

    def daily_total_cost(self):
        return list(map(lambda d: d["total_cost"], self.days))

    def daily_revenue(self):
        return list(map(lambda d: d["daily_revenue"], self.days))

    def daily_reinvest(self):
        return list(map(lambda d: d["daily_reinvest"], self.days))

    def daily_cost(self):
        return list(map(lambda d: d["daily_cost"], self.days))

    def daily_return_of_invest(self):
        return list(map(lambda d: d["return_of_invest"], self.days))

    @staticmethod
    def fltrd_user(user, **kw):
        if user.days_of_activity >= user.max_days_of_activity:
            yield False
        else:
            for k, v in kw.items():
                try:
                    yield v(getattr(user, k))
                except Exception:
                    yield getattr(user, k) == v

    def year(self):
        return int(self.day/365)+1

    def filter(self, **kwargs):
        return filter(lambda user: all(self.fltrd_user(user, **kwargs)), self.user)

    def get(self, **kwargs):
        return list(self.filter(**kwargs))

    def hours(self, time, scale="month"):
        return sum((user.hours(time, scale) for user in self.get()))

    def revenue(self, time, scale="month"):
        return sum(user.revenue(time, scale) for user in self.get())

    def __len__(self):
        return len(self.user)
    
    def next_day(self):
        for usr in self.user:
            usr.days_of_activity += 1
        self.day += 1

    def today(self):
        return {"total_cost": self.total_cost(),
                "total_revenue": self.total_revenue(),
                "total_reinvest": self.total_reinvest(),
                "return_of_invest": self.return_of_invest(),
                "total_user": len(self),
                "daily_revenue": sum(usr.revenue_per_day(1) for usr in self.user),
                "daily_cost": 0,
                "daily_reinvest": 0,
                "day": len(self.days)}

    def next(self, num=1, verbose=False, print_step=15):
        assert num > 0 and type(num) == int

        for i in range(num): 
            self.next_day()
            self.user = self.get()
            self.days.append(self.today())
           
            if i % print_step == 0 and verbose:
                print(f"year: {self.year} day: {self.day - (int(self.day/365) * 365)}")
                print("active_user", len(self))
                print("total_revenue", self.total_revenue())
                print("total_cost:", self.total_cost())
    
    def num_days(self):
        return list(range(len(self.days)))

    def conversion_rate(self):
        return sum(usr.conversion_rate for usr in self.types)

    def conversion_mean(self):
        if len(self.types) > 0:
            return self.conversion_rate()/len(self.types) if len(self.types) > 0 else 0
        else:
            return 0

    def cumulative_revenue(self):
        return [sum(self.daily_revenue()[:i + 1]) for i in self.num_days()]
 
    def lifelong_user(self):
        return list(filter(lambda t: t.max_days_of_activity == math.inf, self.user))

    def lifelong_conversion(self):
        usr = list(map(lambda usr: usr.conversion_rate, filter(lambda t: t.max_days_of_activity == math.inf, self._types)))
        return sum(usr) 

    def dict(self):
        d = self.__dict__.copy()
        del d["_types"]
        # del d["logger"]
        d["active_user"] = self.user
        d["total_cost"] = self.total_cost()
        d["total_reinvest"] = self.total_reinvest()
        d["total_revenue"] = self.total_revenue()
        d["lifelong_user"] = self.lifelong_user()
        d["conversion_rate"] = self.conversion_rate()
        d["lifelong_conversion_rate"] = self.lifelong_conversion()
        d["mean_conversion_rate"] = self.conversion_mean()
        return d

    def json(self):
        d = self.dict()
        d["lifelong_user"] = [usr.json() for usr in d["lifelong_user"]]
        d["active_user"] = [usr.json() for usr in d["active_user"]]
        d["user"] = [usr.json() for usr in self.user]
        d["types"] = [usr.json() for usr in self.types]
        return d

    def copy(self):
        d = self.dict()
        new_user_base = UserBase(0, *self.types, **d)
        return new_user_base

    def simulate_growth(self, investment_plan, days, verbose=False, cost_per_install=None, price_per_hour=None):
        price_per_hour = price_per_hour or self.price_per_hour
        cost_per_install = cost_per_install or self.cost_per_install
        assert cost_per_install
        assert price_per_hour

        user_base_copy = self.new(0, *self.types, price_per_hour=price_per_hour, cost_per_install=cost_per_install)
        for day in range(0, days):
            if day in investment_plan.keys():
                investment = investment_plan[day]["investment"]
                reinvest_rate = investment_plan[day]["reinvestment_rate"]
                if investment > 0:
                    user_base_copy.add(int(investment_plan[day]["investment"] / cost_per_install))
                if 1 > reinvest_rate > 0:
                    user_base_copy.add(int((user_base_copy.total_revenue() * reinvest_rate) / cost_per_install), reinvest=True)
            user_base_copy.next(1, verbose=verbose)
        
        self._temp.append(user_base_copy)
        return user_base_copy

    def new(self, day, *types, **kwargs):
        return type(self)(day, *types, **kwargs)

    @classmethod
    def random(cls, min_conv=.2, max_conv=.3, min_types=3, max_types=8, min_daily_h=.01, max_daily_h=1.2, min_ll_conv=.01, max_ll_conv=.05):
        ll_user_conv = random.uniform(min_ll_conv, max_ll_conv)
        max_conv = random.uniform(min_conv, max_conv) - ll_user_conv
        num_types = random.randint(min_types, max_types)
            
        def get_random_conv(conv):
            new = random.uniform(conv*.2, conv)
            if new == 0 or new == conv:
                new = get_random_conv(conv)
            return new 

        rates = []

        for _ in range(num_types - 1):
            conv = get_random_conv(max_conv)
            rates.append(conv)
            max_conv = max_conv - conv
        
        rates.append(max_conv)
        rates.append(ll_user_conv)
        daily_hours = (random.uniform(min_daily_h, max_daily_h) for _ in range(len(rates)))
        max_days_of_activity = [random.randint(1, 30) for _ in range(len(rates)-1)] + [math.inf]
        zipped = zip(rates, daily_hours, max_days_of_activity)
        types = ({"conversion_rate": i[0], "daily_hours": i[1], "max_days_of_activity": i[2]} for i in zipped)
        new = cls(0, *types)
        return new
    
    def __repr__(self):
        d = self.json()
        del d["user"]
        d["total_user"] = len(self)
        return json.dumps(d, indent=5)
