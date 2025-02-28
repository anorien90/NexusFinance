# Nexus Finance User Base Application

This repository contains a Python application for simulating a user base investment strategy using the Nexus Finance framework. The application allows users to configure various parameters regarding investments and reinvestments, providing a simple way to model user engagement and financial growth over time.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
- [License](#license)
- [Contributing](#contributing)
- [Contact](#contact)

## Installation

To run the application, you need to have Python installed on your machine. Clone the repository and install the required dependencies:

```bash
git clone https://github.com/your-username/nexus-finance-user-base.git
cd nexus-finance-user-base
pip install -r requirements.txt
```

Make sure you have the `nexus_finance` package available in your Python environment.

## Usage

To start the application, run the following command in your terminal:

```bash
python app.py
```

The application will start on port 5000 and will be in debug mode. You can access the application through your web browser at `http://localhost:5000`.

## Configuration

The simulation's strategy can be customized by modifying the `strategy` dictionary in the code:

```python
strategy = {
    "initial_invest": (10000, 50000),       # Initial investment range
    "reinvest_rate": (0.2, 0.8),            # Reinvestment rate range
    "cost_per_install": 2.0,                # Cost per user installation
    "price_per_hour": 0.18,                 # Price per hour of usage
    "target_day": 365,                      # Simulation target days
    "target_user": 10000,                   # Target number of users
    "invest_days": (0, 365),                # Range of investment days
    "reinvest_days": (0, 300),              # Range of reinvestment days
    "num_extra_invest": (0, 24),            # Range of extra investments
    "num_reinvest": (0, 24),                # Range of reinvestments
    "extra_invest": (1000, 100000),         # Extra investment range
    "extra_invest_days": (30, 300),         # Extra investment duration range
}
```

You can also modify the `types` list to define different user types and their respective parameters:

```python
types = [{
    "conversion_rate": 0.05,
    "max_days_of_activity": math.inf,
    "daily_hours": 0.5
}]
```

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! If you have suggestions for improvements or new features, feel free to create an issue or submit a pull request.

## Contact

For any inquiries or feedback, please contact [your-email@example.com].

---

Happy investing!
