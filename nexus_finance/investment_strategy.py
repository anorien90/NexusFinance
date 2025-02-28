

class InvestmentStrategy:
    config = {
                "initial_invest": (1000, 50000),
                "reinvest_rate": (0.2, 0.8),
                "cost_per_install": 2.0,
                "price_per_hour": 0.18,
                "target_day": 365,
                "target_user": 10000,
                "invest_days": (0, 365),
                "reinvest_days": (30, 300),
                "num_extra_invest": (0, 24),
                "num_reinvest": (0, 24),
                "extra_invest": (1000, 100000),
                "extra_invest_days": (30, 300),
                }

    def __init__(self, **kwargs) -> None:
        self.cost_per_install = kwargs.get("cost_per_install", 2.0)
        self.initial_invest = kwargs.get("initial_invest", (1000, 50000))
        self.extra_invest = kwargs.get("extra_invest", (1000, 50000))
        self.num_extra_invest = kwargs.get("num_extra_invest", (0, 24))
        self.num_reinvest = kwargs.get("num_reinvest", (1, 12))
        self.reinvest_rate = kwargs.get("reinvest_rate", (0.1, 0.9))
        self.reinvest_days = kwargs.get("reinvest_days", (1, 365))
        self.target_user = kwargs.get("target_user", 10000)
        self.target_day = kwargs.get("target_day", 365)
        self.extra_invest_days = kwargs.get("extra_invest_days", self.target_day)
        
    def __getitem__(self, key):
        return self.__dict__[key]

    def get(self, key, default=None):
        return getattr(self, key, default)

    @property
    def min_invest(self):
        return self.initial_invest[0]

    @property
    def max_invest(self):
        return self.initial_invest[1]

    @property
    def min_reinvest(self):
        return self.reinvest_rate[0]

    @property
    def max_reinvest(self):
        return self.reinvest_rate[1]

    def __iter__(self):
        return iter(self.__dict__.items())

    def update(self, kwargs):
        for k, v in kwargs.items():
            if hasattr(self, k):
                setattr(self, k, v)

    def dict(self):
        return self.__dict__

