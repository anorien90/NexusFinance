from flask import Flask
# from flask_cors import CORS
import math

from nexus_finance.investment_simulation import InvestmentSimulation
from nexus_finance.investment_strategy import InvestmentStrategy
from nexus_finance.user_base import UserBase
from nexus_finance.app_routes import setup_routes


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


if __name__ == "__main__":
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

    types = [{"conversion_rate": 0.05, "max_days_of_activity": math.inf, "daily_hours": 0.5}]
    app = UserBaseApplication(types, strategy)
    app = setup_routes(app)
    # CORS(app)
    app.run(port=5000, debug=True)

