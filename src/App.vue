<template>
  <v-app>
    <v-container fluid>
      <v-container>
        <!-- Campo de pesquisa -->
        <v-text-field v-model="search" label="Pesquisa" placeholder="Nome do Pokémon" solo></v-text-field>

        <v-row>
          <!-- Exibição dos cards dos pokémons filtrados -->
          <v-col cols="6" sm="4" md="3" lg="2" v-for="pokemon in filtered_pokemons" :key="pokemon.name">
            <v-card class="pokemon-card" @click="show_pokemon(get_id(pokemon))">
              <v-container>
                <v-row class="d-flex justify-center">
                  <img
                    :src="`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${get_id(pokemon)}.png`"
                    :alt="pokemon.name" class="contain" />
                </v-row>
                <v-card-text class="text-center">
                  <span class="text-capitalize font-weight-bold">{{ pokemon.name }}</span>
                </v-card-text>
              </v-container>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-container>

    <v-dialog v-model="show_dialog" width="800">
      <v-card v-if="selected_pokemon">
        <v-container>
          <v-row class="d-flex align-center">
            <!-- Imagem do Pokémon selecionado -->
            <v-col cols="4" md="2">
              <img
                :src="`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${selected_pokemon.id}.png`"
                :alt="selected_pokemon.name" style="width:80%;" />
            </v-col>
            <v-col cols="8" md="10">
              <h1 class="text-capitalize">{{ selected_pokemon.name }}</h1>

              <!-- Chips com os tipos do Pokémon -->
              <v-chip label v-for="type in selected_pokemon.types" :key="type.slot" class="mr-2">{{ type.type.name }}</v-chip>

              <!-- Chips com a altura e peso do Pokémon -->
              <v-chip label class="ml-2">Altura {{ selected_pokemon.height * 2.54 }} cm</v-chip>
              <v-chip class="ml-2" label>Peso {{ (selected_pokemon.weight * 0.45359237).toFixed(0) }} kgs</v-chip>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12" md="12">

              <v-divider class="my-4"></v-divider>

              <h2 class="mt-6 mb-4">Moves</h2>

              <!-- Painéis de expansão para os movimentos do Pokémon -->
              <v-expansion-panels class="mb-4">
                <v-expansion-panel v-for="move_type in ['level-up', 'egg', 'machine', 'tutor']" :key="move_type">
                  <v-expansion-panel-header>
                    {{ move_type }}
                  </v-expansion-panel-header>
                  <v-expansion-panel-content>
                    <!-- Tabela com os movimentos do tipo selecionado -->
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
                          <tr v-for="move in moves[move_type]" :key="move.name">
                            <td>
                              <span v-show="move.level != 0">{{ move.level }}</span>
                            </td>
                            <td>
                              <MoveMethodImage :method="move.method" />
                            </td>
                            <td>{{ move.name }}</td>
                          </tr>
                        </tbody>
                      </template>
                    </v-simple-table>
                  </v-expansion-panel-content>
                </v-expansion-panel>
              </v-expansion-panels>

              <!-- Painel de expansão para as estatísticas do Pokémon -->
              <v-expansion-panels class="mb-4">
                <v-expansion-panel>
                  <template v-slot:header>
                    <h2>Stats</h2>
                  </template>
                  <template v-slot:default>
                    <div class="chart-container">
                      <!-- Gráfico de barras das estatísticas do Pokémon -->
                      <Bar :options="chartOptions" :data="chartData"></Bar>
                    </div>
                  </template>
                </v-expansion-panel>
              </v-expansion-panels>
            </v-col>
          </v-row>
        </v-container>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<script>
import axios from 'axios';
import { Bar } from 'vue-chartjs';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

export default {
  name: 'App',
  components: {
    Bar,
  },
  data() {
    return {
      pokemons: [],
      search: '',
      show_dialog: false,
      selected_pokemon: null,
      moves: {
        'level-up': [],
        egg: [],
        machine: [],
        tutor: [],
      },
      chartData: {},
      chartOptions: {
        responsive: true,
        scales: {
          x: {
            type: 'category',
          },
          y: {
            min: 0, // Valor mínimo do eixo y
            max: 300, // Valor máximo do eixo y
            ticks: {
              stepSize: 10, // Intervalo dos valores exibidos no eixo y
            },
          },
        },
      },
    };
  },
  mounted() {
    // Obter lista inicial de pokémons da API
    axios.get('https://pokeapi.co/api/v2/pokemon?limit=151').then((response) => {
      this.pokemons = response.data.results;
    });
  },
  methods: {
    get_id(pokemon) {
      // Função para obter o ID do Pokémon a partir da URL
      return Number(pokemon.url.split('/')[6]);
    },
    show_pokemon(id) {
      // Exibir informações do Pokémon selecionado
      this.selected_pokemon = null;
      this.moves = {
        'level-up': [],
        egg: [],
        machine: [],
        tutor: [],
      };

      // Obter dados do Pokémon da API
      axios.get(`https://pokeapi.co/api/v2/pokemon/${id}`).then((response) => {
        this.selected_pokemon = response.data;

        // Filtrar movimentos do Pokémon
        this.selected_pokemon.moves.forEach((move) => {
          for (const details of move.version_group_details) {
            if (details.version_group.name === 'sword-shield') {
              this.moves[details.move_learn_method.name].push({
                level: details.level_learned_at,
                method: details.move_learn_method.name,
                name: move.move.name,
              });
              break;
            }
          }
        });

        // Ordenar movimentos por nível e método
        for (const move_type in this.moves) {
          this.moves[move_type].sort((a, b) => {
            let level_a = a.level;
            let level_b = b.level;

            if (level_a === 0) {
              level_a = 1000;
            }

            if (level_b === 0) {
              level_b = 1000;
            }

            if (level_a !== level_b) {
              if (level_a < level_b) {
                return -1;
              } else {
                return 1;
              }
            } else {
              if (a.method < b.method) {
                return -1;
              } else {
                return 1;
              }
            }
          });
        }

        // Configurar dados do gráfico de barras
        this.chartData = {
          labels: this.selected_pokemon.stats.map((stat) => stat.stat.name),
          datasets: [
            {
              label: 'Estatística',
              data: this.selected_pokemon.stats.map((stat) => stat.base_stat),
              backgroundColor: [
                'rgba(66, 255, 76, 1)',   
                'rgba(117, 159, 255, 1)',   
                'rgba(255, 66, 144, 1)',    
                'rgba(255, 203, 79, 1)',   
                'rgba(54, 162, 235, 1)',   
                'rgba(255, 38, 10, 1)',    
              ],
            },
          ],
        };

        this.show_dialog = true;
      });
    },
  },
  computed: {
    filtered_pokemons() {
      // Filtrar lista de pokémons com base no texto de pesquisa
      return this.pokemons.filter((item) => {
        return item.name.includes(this.search);
      });
    },
  },
};
</script>

<style>
#app {
  background: linear-gradient(to bottom right, rgba(10, 10, 10, 1), rgba(12, 39, 63, 1)) no-repeat center center fixed !important;
  -webkit-background-size: cover;
  -moz-background-size: cover;
  -o-background-size: cover;
  background-size: cover !important;
  background-position: center;
  min-height: 100vh;
}

.chart-container {
  width: 100%;
  max-width: 800px;
  /* Defina a largura máxima desejada */
  height: 500px;
  /* Defina a altura desejada */
}
</style>
