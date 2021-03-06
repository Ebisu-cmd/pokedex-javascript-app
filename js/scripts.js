//IIFE for global data/states
let pokemonRepository = (function () {

    //IIFE variables
    let pokemonList = [];
    let searchPokemonList = pokemonList;
    let apiUrl = 'https://pokeapi.co/api/v2/pokemon/?limit=1126';
    let currentModalPokemon = null;
    let modalContainer = document.querySelector('#pokemonModal');

    //Return my array of pokemon
    function getAll() {
        return pokemonList;
    }

    //Add pokemon to pokemonList array
    function add(item) {
        pokemonList.push(item);
    }

    //Verifies added pokemon object: adds pokemon to repository if valid / alerts user if pokemon object is invalid
    function addv(item) {
        //Checks if input is an object and has all the required keys
        if (typeof item === 'object' && 'name' in item && 'detailsUrl' in item) {
            add(item);
        }
        else {
            alert('Pokemon object is not correct');
        }
    }

    //finds pokemons in the array that contains the characters in the input
    function find(inputName) {
        //checks if input is a string
        if (typeof inputName !== 'string') {
            alert('Inputted pokemon name is not a string!')
            return;
        }

        //find pokemons in our array (convert everything to lowercase to ignore case sensitivity)
        let found = pokemonList.filter(function (pokemon) {
            let lowercaseListName = pokemon.name.toLowerCase();
            let lowercaseInputName = inputName.toLowerCase();
            return lowercaseListName.includes(lowercaseInputName);
        });

        //returns found pokemon array
        return found;
    }

    //adds pokemon to list in the app
    function addListItem(pokemon) {
        //select unordered list in html file
        let container = document.querySelector('.container-fluid');

        //create row div, col div, and button
        let rowdiv = document.createElement('div');
        let coldiv = document.createElement('div');
        let button = document.createElement('button');

        //set bootstrap classes and text to divs and button
        rowdiv.classList.add('row', 'align-content-center', 'list-group-item', 'bg-warning');
        rowdiv.setAttribute('style', 'height: 100px');
        coldiv.classList.add('col', 'd-flex', 'justify-content-center', 'm-2');
        button.innerText = pokemon.name;
        button.classList.add('btn', 'btn-danger', 'btn-lg', 'btn-block');
        button.setAttribute('type', 'button');
        button.setAttribute('style', 'height: 75px');
        //set button to open bootstrap modal
        button.setAttribute('data-toggle', 'modal');
        button.setAttribute('data-target', '#pokemonModal');

        //append button to col div, col div to row div, and row div to container
        coldiv.appendChild(button);
        rowdiv.appendChild(coldiv);
        container.appendChild(rowdiv);

        //change modal to have pokemon details when button is clicked
        pokemonButtonListener(button, pokemon);
    }

    // loads Pokemon data from pokemon API and opens modal with data
    function showDetails(pokemon) {
        loadDetails(pokemon).then(function () {
            showModal(pokemon);
        })
    }

    // add event listener to new pokemon buttton
    function pokemonButtonListener(button, pokemon) {
        button.addEventListener('click', function () {
            showDetails(pokemon);
        });
    }

    // load list of pokemon from external pokemon api
    function loadList() {
        return fetch(apiUrl).then(function (response) {
            return response.json();
        }).then(function (json) {
            json.results.forEach(function (item) {
                let pokemon = {
                    name: item.name,
                    detailsUrl: item.url
                };
                addv(pokemon);
            });
        }).catch(function (e) {
            console.error(e);
        })
    }

    // uses imageUrl of pokemon object to fetch more pokemon details from API
    function loadDetails(item) {
        let url = item.detailsUrl;
        return fetch(url).then(function (response) {
            return response.json();
        }).then(function (details) {
            item.imageUrl = details.sprites.front_default;
            item.height = details.height;
            item.types = details.types;
        }).catch(function (e) {
            console.error(e);
        });
    }

    // updates modal with pokemon information
    function showModal(pokemon) {
        // nodes used for modal
        let modalTitle = document.querySelector('.modal-title');
        let modalBody = document.querySelector('.modal-body');
        currentModalPokemon = pokemon;

        // erase all existing modal content
        while (modalBody.firstChild) {
            modalBody.removeChild(modalBody.firstChild);
        }

        // append pokemon name to modal title
        modalTitle.innerText = pokemon.name;

        // get all details about pokemon
        let imageContent = document.createElement('img');
        imageContent.setAttribute('src', pokemon.imageUrl);
        imageContent.setAttribute('alt', 'picture of: ' + pokemon.name);
        let heightElement = document.createElement('p');
        heightElement.innerText = 'height: ' + pokemon.height;
        let typeArray = pokemon.types.map(function (index) {
            return index.type.name;
        })
        let typeElement = document.createElement('p');
        typeElement.innerText = 'type:'
        typeArray.forEach(function (type) {
            typeElement.innerText += ' ' + type;
        });

        // append all pokemon details to modal body
        modalBody.appendChild(imageContent);
        modalBody.appendChild(heightElement);
        modalBody.appendChild(typeElement);
    }

    //variables for pointer events
    let startX = null;

    // takes note of start position of pointer
    function handleStart(e) {
        let x = e.pageX; // X-coordinate of click/touch
        startX = x;
    }

    // checks if pointer traveled enough distance to swap between pokemon modals
    function handleEnd(e) {
        if (Math.abs(e.pageX - startX) > 200) {
            // swipe left: go next pokemon
            if (e.pageX - startX < 0) {
                let index = searchPokemonList.indexOf(currentModalPokemon);
                // if index is last dont go next pokemon
                index === (searchPokemonList.length - 1) ? null : showDetails(searchPokemonList[index + 1]);
                startX = null;
            }
            // swipe right: go previous pokemon
            else if (e.pageX - startX > 0) {
                let index = searchPokemonList.indexOf(currentModalPokemon);
                // if index is first dont go next pokemon
                index === 0 ? null : showDetails(searchPokemonList[index - 1]);
                startX = null;
            }
        }
        else {
            startX = null;
        }
    }

    // event listeners for swiping between data items
    modalContainer.addEventListener('pointerdown', handleStart);
    modalContainer.addEventListener('pointerup', handleEnd);

    // event listener for search bar
    let search_input = document.querySelector('input[type="text"]');
    search_input.addEventListener('input', function () {
        let container = document.querySelector('.container-fluid');
        //if input value is empty show all pokemon
        if (search_input.value === '') {
            searchPokemonList = pokemonList;
            while (container.firstChild) {
                container.removeChild(container.firstChild);
            }
            pokemonRepository.getAll().forEach(function (pokemon) {
                pokemonRepository.addListItem(pokemon);
            });
        }
        //if input value is not empty show all pokemon that contains input
        else {
            searchPokemonList = find(search_input.value);
            while (container.firstChild) {
                container.removeChild(container.firstChild);
            }
            searchPokemonList.forEach(function (pokemon) {
                pokemonRepository.addListItem(pokemon);
            });
        }
    });


    // --- My public functions ---
    return {
        getAll: getAll,
        addv: addv,
        find: find,
        addListItem: addListItem,
        loadList: loadList,
        loadDetails: loadDetails
    };

})();

//load pokemon data
pokemonRepository.loadList().then(function () {
    pokemonRepository.getAll().forEach(function (pokemon) {
        pokemonRepository.addListItem(pokemon);
    });
});
