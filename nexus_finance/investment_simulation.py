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

from deap import base, creator, tools, algorithms
import numpy as np
import random
from .investment_fitness import InvestmentPlanFitness
from itertools import chain


class InvestmentSimulation:

    def __init__(self, 
                 app, 
                 fitness=None,
                 toolbox=None,
                 population_size = 50,
                 generations=20,
                 mutprob=0.2, **weights) -> None:
        self.app = app
        self._population = None
        self._weights = {}
        self._fitness = fitness or InvestmentPlanFitness
        self.weights = weights
        self.population_size = population_size
        self.individuals = []
        self.best_individuals = []
        self.generations = generations
        self.best_score = None
        self.mutprob = mutprob
        self.creator = creator
        self.base = base
        self.toolbox = toolbox or base.Toolbox()
        self.toolbox.register("mate", tools.cxTwoPoint)
        self.toolbox.register("mutate", tools.mutGaussian, mu=0, sigma=1000, indpb=0.2)
        self.toolbox.register("select", tools.selTournament, tournsize=3)
        self.logbook = tools.Logbook()
        self.stats = tools.Statistics(lambda ind: ind.fitness.values[0])
        self.stats.register("mean", np.mean)
        self.stats.register("max", np.max)
        self.stats.register("min", np.min)
        self.register()

    @property
    def fitness(self):
        return self._fitness(self.user_base, self.strategy, **self.weights)

    @property
    def weights(self):
        weights = InvestmentPlanFitness.weights.copy()
        weights.update(self._weights)
        return weights

    @weights.setter
    def weights(self, weights):
        self._weights.update(weights)

    @property
    def population(self):
        return self._population

    @population.setter
    def population(self, val):
        if type(val) == int:
            self._population = self.toolbox.population(n=val)
        else:
            self._popultation = val

    @property
    def strategy(self):
        return self.app.strategy

    @property
    def best_individual(self):
        return [] if len(self.best_individuals) == 0 else sorted(self.best_individuals, key=lambda i: i[0])[0][1]

    @property
    def status(self):
        d = {"best_individual": self.individual_to_schedule(self.best_individual),
             "logbook": self.logbook,
             "generation": 0 if len(self.logbook) == 0 else self.logbook[-1]["gen"],
             "nevals": sum(map(lambda e: e.get("nevals", 0), self.logbook))}
        return d

    @property
    def user_base(self):
        return self.app._user_base

    @property
    def generation(self):
        return len(self.logbook)
     
    def optimize(self, population=20, generations=10, mutprob=0.2, **kwargs):
        self.population = population
        self.logbook.clear()

        for i in range(generations):
            if not self.app.processing:
                break
            self.population, log = algorithms.eaSimple(self.population, 
                                                       self.toolbox, 
                                                       cxpb=0.5, 
                                                       mutpb=mutprob, 
                                                       ngen=1, 
                                                       stats=self.stats, 
                                                       verbose=True)
            log_entry = log[-1]
            log_entry["gen"] = i +1
            self.logbook.append(log_entry)
            best_individual = tools.selBest(self.population, k=1)[0]
            self.best_individuals.append((self.logbook[-1]["min"],  best_individual))
       
        self.individuals = []
        return self.best_individual

    def set_individual(self, individual):
        # ToDo: Implement a reasonable function that returns a random result from either 
        #       a list of individuals or the current stored best individuals matching the strategy parameters -> DB 
        
        def init_individual():
            return individual

        self.toolbox.register("individual", init_individual)

    def register(self):
        # The simulation should only run the deap execution
        if not hasattr(self.creator, "Individual"):
            self.creator.create("FitnessMin", base.Fitness, weights=(-1.0,))
            self.creator.create("Individual", list, fitness=self.creator.FitnessMin)

        self.toolbox.register("attr_init_invest", random.randint, *self.strategy["initial_invest"])  # Initial investment
        self.toolbox.register("attr_extra_invest", random.randint, *self.strategy["extra_invest"])
        self.toolbox.register("attr_extra_invest_days", random.randint, *self.strategy["extra_invest_days"])
        self.toolbox.register("attr_reinvest_rate", random.uniform, *self.strategy["reinvest_rate"])  # Reinvestment rate
        self.toolbox.register("attr_reinvest_days", random.randint, *self.strategy["reinvest_days"])  # Marketing boost days
        self.toolbox.register("attr_num_extra_invest", random.randint, *self.strategy["num_extra_invest"])
        self.toolbox.register("attr_num_reinvest", random.randint, *self.strategy["num_reinvest"])
        self.toolbox.register("individual", self.init_individual)
        self.toolbox.register("population", tools.initRepeat, list, self.toolbox.individual)
        self.toolbox.register("evaluate", self.eval)

    def init_individual(self):
            individual = self._individual()
            self.individuals.append(individual)
            return self.creator.Individual(individual)
    
    def eval(self, individual):
        individual = self.individual_to_schedule(individual)
        return self.fitness.eval(individual)

    @staticmethod
    def schedule_to_individual(schedule):
        return list(chain(*[(int(k), abs(v["investment"]), abs(v["reinvestment_rate"])) for k, v in schedule.items()]))

    @staticmethod
    def individual_to_schedule(individual):
        schedule = {abs(int(individual[i*3])): {"investment": abs(individual[i*3+1]), 
                                                "reinvestment_rate": abs(individual[i*3+2])} for i in range(int(len(individual)/3))}
        def filter_individual(ind):
            vals = ind[1]
            invest, reinvest = abs(vals["investment"]), abs(vals["reinvestment_rate"])
            vals["reinvestment_rate"] = round(reinvest, 2) if 1 >= reinvest >= 0 else 0.0
            vals["investment"] = invest
            return int(ind[0]), vals
        
        schedule = {k: v for k, v in map(filter_individual, schedule.items())}
        return schedule

    def _individual(self):
        return list(chain(self._init_invest(), *self._invests(), *self._reinvests()))

    def _init_invest(self):
        return (0, self.toolbox.attr_init_invest(), 0.0) 

    def _invests(self):
        return [(abs(int(self.toolbox.attr_extra_invest_days())), abs(self.toolbox.attr_extra_invest()), 0.0) for _ in range(self.toolbox.attr_num_extra_invest())]

    def _reinvests(self):
        return [(abs(int(self.toolbox.attr_reinvest_days())), 0, abs(self.toolbox.attr_reinvest_rate())) for _ in range(self.toolbox.attr_num_reinvest())]
