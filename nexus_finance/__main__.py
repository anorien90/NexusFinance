import math

from nexus_finance import UserBaseApplication
from nexus_finance import setup_routes

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
app.run(port=5000, debug=True)
