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
from nexus_finance.app import app
import argparse
import subprocess
import sys


parser = argparse.ArgumentParser()
parser.add_argument("--host", 
                    type=str, 
                    default="127.0.0.1", 
                    help="host address of the app")
parser.add_argument("-p", "--port", 
                    type=int,
                    default=5000,
                    help="port of the application")

parser.add_argument("-s", "--silent",
                   action="store_true",
                   help="Wont open a browser on startup")

parser.add_argument("-d", "--daemon", 
                    action="store_true", 
                    help="Run as a background process")

args = parser.parse_args()

if args.daemon:
    LOG_FILE = "nexus_finance_error.log"
    print("Starting Nexus-Finance in daemon mode...")
    cmd = [sys.executable] + sys.argv
    cmd.remove("-d") if "-d" in cmd else cmd.remove("--daemon")
    with open(LOG_FILE, "w") as log:
        try:
            process = subprocess.Popen(cmd, stdout=log, stderr=log,)
            import time
            time.sleep(2)
            if process.poll() is not None:
                print(f"Error: Nexus-Finance failed to start. Check {LOG_FILE} for details.")
                sys.exit(1)
            else:
                print(f"Nexus-Finance started successfully in the background (PID: {process.pid})")
                sys.exit(0)

        except Exception as e:
            print(f"Failed to start Nexus-Finance: {e}")
            sys.exit(1)

if not args.silent:
    print("silent")
    import webbrowser
    from threading import Timer
    
    def open_browser(host="http://127.0.0.1", port=5000, **kwargs):
        def wrapper():
            webbrowser.open(f"{host}:{port}", new=1)
        return wrapper
 
    def run_decorator(func):
        def wrapper(*args, **kwargs):
            Timer(1, open_browser(**kwargs)).start()
            func(*args, **kwargs)

        return wrapper
    
    app.run = run_decorator(app.run)

app.run(host=args.host, port=args.port)
