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

import webbrowser
from flask import Flask
from nexus_finance.investment_simulation import InvestmentSimulation
from nexus_finance.investment_strategy import InvestmentStrategy
from nexus_finance.user_base import UserBase
from nexus_finance.app_routes import setup_routes
from flask_cors import CORS

class UserBaseApplication(Flask):

    def __init__(self, types=[], strategy={}):
        super().__init__(__name__, static_folder="static", static_url_path="/")
        self._user_base = UserBase(0, *types)
        self._strategy = InvestmentStrategy(**strategy)
        self._simulation = InvestmentSimulation(self)
        self._status = {"processing": False}

    @property
    def status(self):
        return {**self._status, **self.simulation.status}

    @property
    def processing(self):
        return self.status["processing"]

    @processing.setter
    def processing(self, value):
        assert type(value) == bool
        self._status["processing"] = value

    @property
    def strategy(self):
        return self._strategy
    
    @property
    def simulation(self):
        return self._simulation

    @property
    def user_base(self):
        return self._user_base

    @user_base.setter
    def user_base(self, val):
        if type(val) is UserBase:
            self.user_base = val
        else:
            try:
                self._user_base = UserBase(0, **val, **self.strategy)

            except Exception as e:
                raise TypeError(f"{e}{val} has not the correct type. Provide either a UserBase or a dict like iterable")

    def simulate_growth(self, **kwargs):
        self.processing = True
        investment_schedule = {int(k): v for k, v in kwargs.items()}
        self._user_base = self.user_base.simulate_growth(investment_schedule, days=self.strategy.get("target_day", 365))
        self.processing = False

    def optimize_plan(self, **kwargs):
        self.processing = True
        individual = self.simulation.optimize(**kwargs)
        final_strategy = self.simulation.individual_to_schedule(individual) 
        self.processing = False
        return final_strategy

strategy = {
            "initial_invest": (10000, 50000),
            "reinvest_rate": (0.2, 0.8),
            "cost_per_install": 2.0,
            "price_per_hour": 0.18,
            "target_day": 365,
            "target_user": 10000,
            "invest_days": (0, 365),
            "reinvest_days": (0, 300),
            "num_extra_invest": (0, 24),
            "num_reinvest": (0, 24),
            "extra_invest": (1000, 100000),
            "extra_invest_days": (30, 300),
            }

types = []
app = UserBaseApplication(types, strategy)
app = setup_routes(app)
CORS(app)

if __name__ == "__main__":
    webbrowser.open("http://127.0.0.1:5000")
    app.run(host="0.0.0.0", port=5000, debug=False)
