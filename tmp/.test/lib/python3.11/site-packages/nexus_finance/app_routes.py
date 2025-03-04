from flask import request, jsonify, send_from_directory


def convert_user(usr):
    doa = usr.get("max_days_of_activity", None)
    max_days = float("inf") if any(map(lambda k: doa == k, ("Infinity", None))) else doa
    conv_rate = float(usr.get("conversion_rate", 0.01))
    daily_hrs = float(usr.get("daily_hours", 0.01))
    user = {"conversion_rate": conv_rate,
            "max_days_of_activity": max_days,
            "daily_hours": daily_hrs}
    return user

def setup_routes(app):
    @app.route("/")
    def serve_frontend():   
        return send_from_directory(app.static_folder, "index.html")



    @app.route("/api/simulate", methods=["POST"])
    def simulate():
        try:
            data = request.json or {}
            plan = data.get("investment_plan", [])
            assert plan
            app.simulate_growth(**plan)
            return jsonify(app.user_base.json())
        
        except Exception as e:
            return jsonify({"error": str(e)}), 400

    @app.route("/api/status", methods=["GET"])
    def status():
        try: 
            return jsonify(app.status), 200
        
        except Exception as e:
            return jsonify({"error": str(e)}), 400

    @app.route("/api/processing", methods=["GET", "POST"])
    def processing():
        try:
            if request.method == "GET":
                return jsonify({"processing": app.processing}), 200
            
            else:
                data = request.json or {}
                app.processing = data.get("processing", app.processing)
                return jsonify({"processing": app.processing}), 200

        except Exception as e:
            print(e)
            return jsonify({"error": str(e)}), 400
  
    @app.route("/api/optimize", methods=["GET", "POST"])
    def optimize():
        try: 
            if request.method == "POST":
                data = request.json
                final_strategy = app.optimize_plan(**data)
                return jsonify(final_strategy), 200
            else:
                return jsonify(app.simulation.status), 200
      
        except Exception as e:
            print(e)
            return jsonify({"error": str(e)}), 400
   
    @app.route("/api/strategy", methods=["GET", "POST"])
    def strategy():
        if request.method == "GET":
            return jsonify(app.strategy.dict())

        elif request.method == "POST":
            try:
                data = request.json
                app._strategy.update(data)
                return jsonify(app.strategy.dict()), 200
            
            except Exception as e:
                return jsonify({"error": str(e)}), 400
 
    @app.route("/api/user_base", methods=["GET", "POST"])
    def get_user_base():
        if request.method == "GET":
            return jsonify(app._user_base.json())
        else:
            try:
                data = request.json or {}
                user_types = data.get("types", [])
                user_types = map(convert_user, user_types)
                app._user_base = app.user_base.new(0, *user_types)                
                return jsonify(app.user_base.json()), 200
            
            except Exception as e:
                return jsonify({"error": str(e)}), 400
 
    @app.route("/api/user_base/last", methods=["GET"])
    def last():
        try:
            last = app.user_base if len(app.user_base._temp) == 0 else app.user_base._temp[-1]
            if len(app.user_base._temp) > 1:
                last = app.user_base._temp.pop(0)

            response = jsonify(last.json()), 200
            return response

        except Exception as e:
            return jsonify({"error": str(e)}), 400
    
    @app.route("/api/user_base/types", methods=["GET", "POST"])
    def get_user_base_types():
        try:
            if request.method == "GET":
                d = {"types": [usr.json() for usr in app.user_base.types]}
                return jsonify(d)
    
            elif request.method == "POST":
                data = request.json or {}
                user_types = data.get("types", [])
                user_types = map(convert_user, user_types)
                app._user_base = app.user_base.new(0, *user_types)
                d = {"types": [usr.json() for usr in app.user_base.types]}
                return jsonify(d), 200

        except Exception as e:
            return jsonify({"error": str(e)}), 400

    return app 
