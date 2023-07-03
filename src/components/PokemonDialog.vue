<template>
    <v-dialog v-model="show" width="800">
      <v-card v-if="pokemon">
        <v-container>
          <v-row class="d-flex align-center">
            <v-col cols="4" md="2">
              <img :src="`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`" :alt="pokemon.name" style="width:80%;" />
            </v-col>
            <v-col cols="8" md="10">
              <h1 class="text-capitalize">{{ pokemon.name }}</h1>
  
              <v-chip label v-for="type in pokemon.types" :key="type.slot" class="mr-2">{{ type.type.name }}</v-chip>
  
              <v-chip label class="ml-2">Altura {{ (pokemon.height * 2.54).toFixed(2) }} cm</v-chip>
              <v-chip class="ml-2" label>Peso {{ (pokemon.weight * 0.45359237).toFixed(2) }} kgs</v-chip>
  
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12" md="12">
  
              <v-divider class="my-4"></v-divider>
  
              <h2 class="mt-6 mb-4">Moves</h2>
  
              <v-expansion-panels class="mb-4">
                <v-expansion-panel v-for="moveType in ['level-up', 'egg', 'machine', 'tutor']" :key="moveType">
                  <v-expansion-panel-header>
                    {{ moveType }}
                  </v-expansion-panel-header>
                  <v-expansion-panel-content>
                    <v-simple-table>
                      <template>
                        <thead>
                          <tr>
                            <th class="text-left">Level</th>
                            <th class="text-left">Method</th>
                            <th class="text-left">Name</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-for="move in moves[moveType]" :key="move.name">
                            <td>
                              <span v-show="move.level !== 0">{{ move.level }}</span>
                            </td>
                            <td>
                              <!-- MoveMethodImage component goes here -->
                            </td>
                            <td>{{ move.name }}</td>
                          </tr>
                        </tbody>
                      </template>
                    </v-simple-table>
                  </v-expansion-panel-content>
                </v-expansion-panel>
              </v-expansion-panels>
  
              <v-expansion-panels class="mb-4">
                <v-expansion-panel>
                  <template v-slot:header>
                    <h2>Stats</h2>
                  </template>
                  <template v-slot:default>
                    <div class="chart-container">
                      <bar-chart :options="chartOptions" :data="chartData"></bar-chart>
                    </div>
                  </template>
                </v-expansion-panel>
              </v-expansion-panels>
            </v-col>
          </v-row>
        </v-container>
      </v-card>
    </v-dialog>
  </template>
  
  <script>
  import { Bar } from 'vue-chartjs';
  
  export default {
    name: 'PokemonDialog',
    components: {
      BarChart: Bar,
    },
    data() {
      return {
        show: false,
      };
    },
    props: {
      pokemon: {
        type: Object,
        required: true,
      },
      moves: {
        type: Object,
        required: true,
      },
    },
    computed: {
      chartData() {
        return {
          labels: this.pokemon.stats.map((stat) => stat.stat.name),
          datasets: [
            {
              label: 'Base Stat',
              data: this.pokemon.stats.map((stat) => stat.base_stat),
              backgroundColor: 'rgba(255, 99, 132, 0.2)',
              borderColor: 'rgba(255, 99, 132, 1)',
              borderWidth: 1,
            },
          ],
        };
      },
      chartOptions() {
        return {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
            },
          },
          plugins: {
            legend: {
              display: false,
            },
          },
        };
      },
    },
  };
  </script>
  
  <style scoped>
  .chart-container {
    width: 100%;
    height: 300px;
  }
  </style>
  