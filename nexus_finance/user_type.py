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


class User:

    def __init__(self, 
                 conversion_rate=.2,
                 daily_hours=.25,
                 days_of_activity=0,
                 max_days_of_activity=30,
                 price_per_hour=.18
                 ):
        self.conversion_rate = conversion_rate
        self.daily_hours = daily_hours
        self.days_of_activity = days_of_activity
        self.max_days_of_activity = max_days_of_activity
        self.price_per_hour = price_per_hour

    def hours(self, time, scale="month"):
        try:
            key = f"hours_per_{scale}"
            return getattr(self, key)(time)
        
        except AttributeError:
            raise KeyError(f"{scale} is not a legal scale.")

    def revenue(self, time, scale="month"):
        key = f"revenue_per_{scale}"
        try:
            return getattr(self, key)(time)
        
        except AttributeError as e:
            raise e
 
    def hours_per_day(self, day): 
        return self.daily_hours * min(self.max_days_of_activity-self.days_of_activity, day)

    def hours_per_month(self, months):
        if type(months) in (int, float):
            return self.hours_per_day(365/12) * months

        elif type(months) in (list, tuple, iter):
            return self.hours_per_day(sum(months))
        
        else:
            raise TypeError(f"{months} must be an iterable of numbers or number")

    def hours_per_year(self, years):
        if type(years) in (int, float):
            return self.hours_per_day(365) * years 
        
        elif type(years) in (list, tuple, iter):
            return self.hours_per_day(sum(years))
        
        else:
            raise TypeError(f"{years} must be an iterable of numbers or number")

    def revenue_per_hour(self, hours, price=None):
        price = price or self.price_per_hour
        return hours * price

    def revenue_per_day(self, days, price=None):
        price = price or self.price_per_hour
        days = min(days, self.max_days_of_activity - self.days_of_activity)
        return self.revenue_per_hour(self.hours_per_day(1), price) * days

    def revenue_per_month(self, months, price=None):
        price = price or self.price_per_hour
        
        if type(months) in (int, float):
            return self.revenue_per_day((365/12) * months, price) 
        
        elif type(months) in (list, tuple, iter):
            return self.revenue_per_day(sum(months))
    
    def revenue_per_year(self, years, price=None):
        price = price or self.price_per_hour
        
        if type(years) in (int, float):
            return self.revenue_per_day(365 * years, price) 
        
        elif type(years) in (list, tuple, iter):
            return self.revenue_per_day(sum(years), price)
    
    def dict(self):
        return self.__dict__
    
    def json(self):
        d = self.dict().copy()
        if d["max_days_of_activity"] == math.inf:
            d["max_days_of_activity"] = "Infinity"

        return d

    def __iter__(self):
        return iter(self.dict().items())
    
    def __getitem__(self, key):
        return self.dict()[key]
    
    def __setitem__(self, key, val):
        return setattr(self, key, val)

    def copy(self):
        return type(self)(**dict(self))

if __name__ == "__main__":
    usr = User()
    usr["daily_hours"] = 1.4
    usr.max_days_of_activity = 1

