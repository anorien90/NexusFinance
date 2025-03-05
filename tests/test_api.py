import unittest
import json
from nexus_finance.app_routes import setup_routes
from nexus_finance.app import UserBaseApplication



class TestAPI(unittest.TestCase):
    
    def setUp(self):
        """Set up the test client before each test."""
        strategy =  {"initial_invest": (1000, 50000), 
                 "reinvest_rate" : (0.1, 0.2),
                 "cost_per_install": 2.0,
                 "target_day" : 30, 
                 "target_user": 10000, 
                 "invest_days": (0, 1),
                 "reinvest_days": (0, 3), 
                 "num_extra_invest": (0, 24),
                 "num_reinvest": (0, 24),
                 "extra_invest": (1000, 100000),
                 "extra_invest_days": (0, 3),
                 }

        types = [{"max_days_of_activity": 30, "daily_hours": 0.1, "conversion_rate": .05}]
        self.app = UserBaseApplication(types, strategy)
        setup_routes(self.app)  # Set up routes from your provided function
        self.client = self.app.test_client()

    def test_serve_frontend(self):
        """Test the frontend route."""
        response = self.client.get('/')
        self.assertEqual(response.status_code, 200)
        self.assertIn(b"<!doctype html>", response.data)  # Assuming 'index.html' is served as HTML

    def test_simulate_post(self):
        """Test the '/api/simulate' POST route."""
        data = {"investment_plan" : {0: {"investment": 1000, "reinvestment_rate": 0.0}}}  # Replace with actual plan data
        response = self.client.post('/api/simulate', json=data)
        self.assertEqual(response.status_code, 200)
        response_json = json.loads(response.data)
        self.assertIn("active_user", response_json)

    def test_simulate_post_error(self):
        """Test the '/api/simulate' POST route with incorrect data."""
        response = self.client.post('/api/simulate', json={"invalid" : "data"})
        self.assertEqual(response.status_code, 400)
        response_json = json.loads(response.data)
        self.assertIn("error", response_json)

    def test_status_get(self):
        """Test the '/api/status' GET route."""
        response = self.client.get('/api/status')
        self.assertEqual(response.status_code, 200)
        response_json = json.loads(response.data)
        self.assertIn("generation", response_json)

    def test_processing_get(self):
        """Test the '/api/processing' GET route."""
        response = self.client.get('/api/processing')
        self.assertEqual(response.status_code, 200)
        response_json = json.loads(response.data)
        self.assertIn("processing", response_json)

    def test_processing_post(self):
        """Test the '/api/processing' POST route."""
        data = {"processing": True}
        response = self.client.post('/api/processing', json=data)
        self.assertEqual(response.status_code, 200)
        response_json = json.loads(response.data)
        self.assertEqual(response_json['processing'], True)

    def test_optimize_get(self):
        """Test the '/api/optimize' GET route."""
        response = self.client.get('/api/optimize')
        self.assertEqual(response.status_code, 200)
        response_json = json.loads(response.data)
        self.assertIn("generation", response_json)

    def test_strategy_get(self):
        """Test the '/api/strategy' GET route."""
        response = self.client.get('/api/strategy')
        self.assertEqual(response.status_code, 200)
        response_json = json.loads(response.data)
        self.assertIn("extra_invest", response_json)

    def test_strategy_post(self):
        """Test the '/api/strategy' POST route."""
        data = {"extra_invest": [10, 1000]}  # Replace with the actual strategy data
        response = self.client.post('/api/strategy', json=data)
        self.assertEqual(response.status_code, 200)
        response_json = json.loads(response.data)
        self.assertIn("extra_invest", response_json)

    def test_user_base_get(self):
        """Test the '/api/user_base' GET route."""
        response = self.client.get('/api/user_base')
        self.assertEqual(response.status_code, 200)
        response_json = json.loads(response.data)
        self.assertIn("active_user", response_json)

    def test_user_base_post(self):
        """Test the '/api/user_base' POST route."""
        data = {"types": [{"max_days_of_activity": 30, "conversion_rate": 0.02, "daily_hours": 3}]}
        response = self.client.post('/api/user_base', json=data)
        self.assertEqual(response.status_code, 200)
        response_json = json.loads(response.data)
        self.assertIn("active_user", response_json)

    def test_user_base_last_get(self):
        """Test the '/api/user_base/last' GET route."""
        response = self.client.get('/api/user_base/last')
        self.assertEqual(response.status_code, 200)
        response_json = json.loads(response.data)
        self.assertIn("active_user", response_json)

    def test_user_base_types_get(self):
        """Test the '/api/user_base/types' GET route."""
        response = self.client.get('/api/user_base/types')
        self.assertEqual(response.status_code, 200)
        response_json = json.loads(response.data)
        self.assertIn("types", response_json)

    def test_user_base_types_post(self):
        """Test the '/api/user_base/types' POST route."""
        data = {"types": [{"max_days_of_activity": 30, "conversion_rate": 0.02, "daily_hours": 3}]}
        response = self.client.post('/api/user_base/types', json=data)
        self.assertEqual(response.status_code, 200)
        response_json = json.loads(response.data)
        self.assertIn("types", response_json)


if __name__ == '__main__':
    unittest.main()

