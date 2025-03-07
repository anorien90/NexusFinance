
# User Base Investment Simulation

This project is a Flask-based web application that simulates investment strategies for a user base. It leverages genetic algorithms for optimization and provides an API to simulate growth and optimize investment plans based on user data and strategies. The application can be used for investment planning, growth simulation, and strategy optimization.

## Table of Contents

- [Overview](#overview)
- [Installation](#installation)
- [Usage](#usage)
  - [Running the Application](#running-the-application)
  - [API Endpoints](#api-endpoints)
- [Project Structure](#project-structure)
- [Customization](#customization)
- [Contributing](#contributing)
- [License](#license)

## Overview

The `User Base Investment Simulation` application is designed to simulate and optimize investment strategies for user growth. It combines:

1. **User Base Simulation**: Simulates user growth over time based on investments and reinvestments.
2. **Investment Strategy**: Defines a strategy for investing and reinvesting to maximize user base growth.
3. **Genetic Algorithm Optimization**: Uses genetic algorithms (through the DEAP library) to optimize the investment strategy.

The application includes routes for simulating growth, optimizing the investment plan, and managing user base and strategy.

## Installation

### Prerequisites


```bash
pip install nexus-finance
```

You can also clone the git repository.

```bash
git clone https://github.com/anorien90/NexusFinance.git

```


## Usage

### Running the Application

To start the Flask application, run the following command:

```bash
python -m nexus_finance
```

If you have the git repository and want to run the binary.

For Linux use.

```bash
NexusFinance/bin/nexus_finance

```

For Windows run 

```bash
NexusFinance\bin\nexus_finance.exe
```

!! Note Windows wont allow execution without giving permission as the .exe is not certified. 
If you don't cant't/want to allow user pip install nexus-finance instead !!


By default, the application will run on `http://localhost:5000`. You can access the application via a web browser or interact with it through the API endpoints.

### API Endpoints

The application provides several API routes for simulating investment growth, optimizing strategies, and managing user base data. Below is a list of available routes and their usage.

#### 1. **`GET /`** - Serve Frontend

This serves the static frontend page (typically `index.html`) to the user.

#### 2. **`POST /api/simulate`** - Simulate Investment Growth

This endpoint allows you to simulate the growth of the user base based on the provided investment plan.

- **Request Body**:
  ```json
  {
    "investment_plan": {
      "1": {"investment": 1000, "reinvestment_rate": 0.2},
      "2": {"investment": 1500, "reinvestment_rate": 0.3}
    }
  }
  ```

- **Response**:
  - Status code: `200 OK` on success.
  - Returns the current state of the user base.

#### 3. **`GET /api/status`** - Get Simulation Status

This endpoint provides the current status of the simulation.

- **Response**:
  - Status code: `200 OK`
  - Returns the status of the simulation (e.g., if it's processing or completed).

#### 4. **`GET /api/processing`** - Check Processing Status

This endpoint allows you to check if the simulation is currently processing.

- **Response**:
  - Status code: `200 OK`
  - Returns the current processing status (`true` or `false`).

#### 5. **`POST /api/processing`** - Set Processing Status

This endpoint allows you to update the processing status.

- **Request Body**:
  ```json
  {
    "processing": true
  }
  ```

- **Response**:
  - Status code: `200 OK`
  - Returns the updated processing status.

#### 6. **`POST /api/optimize`** - Optimize Investment Plan

This endpoint is used to optimize the investment strategy using genetic algorithms.

- **Request Body**:
  ```json
  {
    "population": 50,
    "generations": 20,
    "mutprob": 0.2
  }
  ```

- **Response**:
  - Status code: `200 OK`
  - Returns the optimized investment strategy.

#### 7. **`GET /api/strategy`** - Get Current Strategy

This endpoint retrieves the current investment strategy.

- **Response**:
  - Status code: `200 OK`
  - Returns the current investment strategy.

#### 8. **`POST /api/strategy`** - Set New Strategy

This endpoint allows you to update the current investment strategy.

- **Request Body**:
  ```json
  {
    "initial_invest": [10000, 50000],
    "reinvest_rate": [0.2, 0.8],
    "target_day": 365
  }
  ```

- **Response**:
  - Status code: `200 OK`
  - Returns the updated investment strategy.

#### 9. **`GET /api/user_base`** - Get User Base

This endpoint retrieves the current user base data.

- **Response**:
  - Status code: `200 OK`
  - Returns the user base data in JSON format.

#### 10. **`POST /api/user_base`** - Set New User Base

This endpoint allows you to update the user base.

- **Request Body**:
  ```json
  {
    "types": [
      {"conversion_rate": 0.05, "max_days_of_activity": "Infinity", "daily_hours": 0.5, "price_per_hour": .1}
    ]
  }
  ```

- **Response**:
  - Status code: `200 OK`
  - Returns the updated user base.

#### 11. **`GET /api/user_base/last`** - Get Last User Base State

This endpoint retrieves the last state of the user base.

- **Response**:
  - Status code: `200 OK`
  - Returns the last state of the user base.

#### 12. **`GET /api/user_base/types`** - Get User Base Types

This endpoint retrieves all user base types.

- **Response**:
  - Status code: `200 OK`
  - Returns the types of users in the user base.

## Project Structure

Here's an overview of the project structure:

```
.
├── nexus_finance/
│   ├── app.py               # Main application file
│   ├── __init__.py      # Package initialization
│   ├── investment_simulation.py   # Investment simulation logic
│   ├── investment_strategy.py     # Investment strategy logic
│   ├── user_base.py            # User base management
│   ├── app_routes.py           # API route definitions
│   ├── static/
│   └── index.html           # Static frontend (optional)
├── requirements.txt         # Python dependencies
└── README.md              # This file
```

## Customization

### Adjusting the Investment Strategy

The investment strategy can be customized by updating the `strategy` dictionary when initializing the `UserBaseApplication`. You can modify parameters like:

- **Initial Investment Range** (`initial_invest`)
- **Reinvestment Rate Range** (`reinvest_rate`)
- **Target Day** (`target_day`)
- **Extra Investment Parameters** (`extra_invest`, `extra_invest_days`, etc.)

### Modifying User Base Types

You can customize the user base by updating the `types` array with different user attributes like:

- **Conversion Rate** (`conversion_rate`)
- **Max Days of Activity** (`max_days_of_activity`)
- **Daily Active Hours** (`daily_hours`)

## Contributing

If you'd like to contribute to the project, feel free to fork the repository, make your changes, and submit a pull request. Please make sure to follow the code style and include tests for new features or fixes.

## License

This project is licensed under the GPLv3 License - see the [LICENSE](LICENSE) file for details.

---

### Additional Notes

1. If you want to include any specific setup instructions, like setting up a database, you can do that here.
2. Consider adding a **`requirements.txt`** if you haven't already, to list all the dependencies.

With this detailed README, your users will be able to understand how to install, configure, and use your application with ease.`
