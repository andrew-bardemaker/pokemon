import { shallowMount } from '@vue/test-utils';
import App from './App.vue';

// Adicione esta linha para simular as chamadas à API usando o Jest
jest.mock('axios');

describe('App', () => {
  test('should render correctly', () => {
    const wrapper = shallowMount(App);
    expect(wrapper.exists()).toBe(true);
  });

  test('should update search correctly', () => {
    const wrapper = shallowMount(App);
    const searchInput = wrapper.find('input[type="text"]');

    // Atualiza o valor do campo de pesquisa
    searchInput.setValue('Pikachu');
    expect(wrapper.vm.search).toBe('Pikachu');
  });

  test('should filter pokemons correctly', () => {
    const wrapper = shallowMount(App);
    wrapper.setData({ pokemons: [{ name: 'Pikachu' }, { name: 'Charmander' }] });

    // Define o texto de pesquisa
    wrapper.vm.search = 'Pika';
    expect(wrapper.vm.filtered_pokemons).toEqual([{ name: 'Pikachu' }]);
  });

  test('should get correct ID for a pokemon', () => {
    const wrapper = shallowMount(App);
    const pokemon = { url: 'https://pokeapi.co/api/v2/pokemon/25' };
    const id = wrapper.vm.get_id(pokemon);

    // Verifica se o ID do Pokémon está correto
    expect(id).toBe(25);
  });

  test('should show pokemon details correctly', async () => {
    const wrapper = shallowMount(App);
    const axiosGetMock = jest.spyOn(wrapper.vm.axios, 'get');
    const pokemonData = {
      id: 25,
      name: 'Pikachu',
      types: [{ type: { name: 'Electric' } }],
      height: 4,
      weight: 60,
      moves: [{ move: { name: 'Thunderbolt' }, version_group_details: [{ version_group: { name: 'sword-shield' }, level_learned_at: 20, move_learn_method: { name: 'level-up' } }] }],
      stats: [{ stat: { name: 'hp' }, base_stat: 35 }],
    };

    // Simula a resposta da chamada à API
    axiosGetMock.mockResolvedValueOnce({ data: pokemonData });

    // Chama o método show_pokemon passando o ID do Pokémon
    wrapper.vm.show_pokemon(25);
    await wrapper.vm.$nextTick();

    // Verifica se os dados do Pokémon e movimentos estão corretos
    expect(wrapper.vm.selected_pokemon).toEqual(pokemonData);
    expect(wrapper.vm.moves).toEqual({ 'level-up': [{ level: 20, method: 'level-up', name: 'Thunderbolt' }], egg: [], machine: [], tutor: [] });
  });
});
