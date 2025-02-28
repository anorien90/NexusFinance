# README.md

## UserBase Application

### Overview
The UserBase Application is designed for simulating investment strategies and managing user bases in a financial context. It leverages Flask for web-based interactions and implements various algorithms for investment simulation and optimization.

### Installation
To run this application, ensure you have Python and the required libraries installed. You can install the necessary packages with the following command:

```bash
pip install flask plotly dash deap numpy
```

### Application Structure
- **app.py**: The main application file that initializes the Flask application and sets up routes.
- **app_routes.py**: Contains all the API routes for the application.
- **investment_simulation.py**: Contains the logic for simulating investments and calculating fitness based on various strategies.
- **investment_strategy.py**: Defines the investment strategy and configurations.
- **user_base.py**: Manages the user base, tracks user activities, and simulates user growth.
- **user_type.py**: Defines user characteristics and behaviors.

### Usage
To start the application, run:

```bash
python app.py
```

The application will be accessible at `http://localhost:5000`.

### API Endpoints
- **GET /api/simulate**: Simulate user growth based on an investment plan.
- **GET /api/status**: Retrieve the current status of the application.
- **GET /api/processing**: Check if a process is currently running.
- **POST /api/processing**: Set the processing state.
- **POST /api/optimize**: Optimize the investment plan based on provided parameters.
- **GET /api/strategy**: Get the current investment strategy.
- **POST /api/strategy**: Update the investment strategy.
- **GET /api/user_base**: Retrieve information about the user base.
- **POST /api/user_base**: Update the user base with new user types.
- **GET /api/user_base/types**: Get types of users in the user base.

### Key Classes and Methods
- **UserBaseApplication**: Extends Flask to manage user bases and investment strategies.
  - `simulate_growth(**kwargs)`: Simulate user growth based on the provided investment plan.
  - `optimize_plan(**kwargs)`: Optimize the investment strategy based on individual investment plans.

- **UserBase**: Manages user instances and their activities.
  - `add(num_user, *user_types)`: Add users to the user base.
  - `simulate_growth(investment_plan, days)`: Simulate user growth based on the investment plan.

- **InvestmentSimulation**: Handles the genetic algorithm for optimizing investment plans.
  - `optimize(population, generations)`: Optimize the investment strategy over a number of generations.

- **InvestmentStrategy**: Contains configuration for investment parameters.
  - `get(key, default)`: Retrieve specific strategy parameters.

### Example Investment Strategy
An example investment strategy can be defined as follows:

```python
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
```

### License
This project is licensed under the MIT License. 

### Conclusion
The UserBase Application is a powerful tool for simulating investment strategies and analyzing user growth in a financial setting. With its user-friendly API and robust backend, it can be a valuable resource for financial analysts and investors alike.
```
