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
from flask_cors import CORS

from .app import UserBaseApplication
from .app_routes import setup_routes

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
CORS(app)

app.run(port=5000, debug=True)
