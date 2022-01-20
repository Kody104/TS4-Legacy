let traitRepo = (function() {

    const traits = [];
    const base_packs = [];

    function parseTraitsJSON() {
        return new Promise(resolve => {
            fetch('https://kody104.github.io/TS4-Legacy/js/traits.json').then( response => response.json()
            ).then( data => {
                data.traits.forEach( trait => {
                    traits.push(trait);
                    /* Sorting through base packs to get all the dlcs */
                    let toAdd = true;
                    for(let i = 0; i < base_packs.length; i++) {
                        if(base_packs[i].name === trait.base_pack.name) {
                            toAdd = false;
                            break;
                        }
                    }
                    if(toAdd) {
                        base_packs.push(trait.base_pack);
                    }
                });
            })
            .then(() => {
                resolve();
            })
            .catch(error => {
                console.warn(error);
            });
        });
    }

    function getTraitByName(tName) {
        for(let i = 0; i < traits.length; i++) {
            if(traits[i].name.toLowerCase() === tName.toLowerCase()) {
                return traits[i];
            }
        }
    }

    function getTraitsByCategory(cName) {
        const list = [];
        traits.forEach(trait => {
            if(trait.category === cName) {
                list.push(trait);
            }
        });
        return list;
    }

    function getTraitsByBasePack(pName) {
        const list = [];
        traits.forEach(trait => {
            if(trait.base_pack.name.toLowerCase() === pName.toLowerCase()) {
                list.push(trait);
            }
        });
        return list;
    }

    function getAll() {
        return traits;
    }

    function getBasePacks() {
        return base_packs;
    }

    return {
        parseTraitsJSON: parseTraitsJSON,
        getTraitByName: getTraitByName,
        getTraitsByCategory: getTraitsByCategory,
        getTraitsByBasePack: getTraitsByBasePack,
        getAll: getAll,
        getBasePacks: getBasePacks
    }
})();
let dynastyRepo = (function() {
    let members = [
        /*{
            firstName: 'test',
            lastName: 'one'
        },
        {
            firstName: 'test',
            lastName: 'two'
        }*/
    ];

    function getAll() {
        return members;
    }

    function deleteMember(index) {
        members.splice(index, 1);
    }

    function clear() {
        members = [];
    }

    return {
        getAll: getAll,
        deleteMember: deleteMember,
        clear: clear
    }
})();
let running = (function() {

    let dlcList = [];
    let traitPool = [];

    let buttonHandler = (function() {
        let items = [];

        function addButton(name, eventType, button, fnct) {
            items.push({
                name: name,
                button: button,
                fnct: fnct,
                bindListener: function() {
                    button.addEventListener(eventType, fnct);
                },
                unbindListener: function() {
                    button.removeEventListener(eventType, fnct);
                }
            });
        }

        function removeButton(index) {
            items.splice(index, 1);
        }

        function getButtonByIndex(index) {
            return items[index];
        }

        function getButtonByName(name) {
            for(let i = 0; i < items.length; i++) {
                if(items[i].name === name) {
                    return items[i];
                }
            }
        }

        function getAllButtons() {
            return items;
        }

        return {
            addButton: addButton,
            removeButton: removeButton,
            getButtonByIndex: getButtonByIndex,
            getButtonByName: getButtonByName,
            getAllButtons: getAllButtons
        }
    })();

    let slide = {
        in: (element) => {
            return new Promise(resolve => {
                element.classList.add('slide-in');
                element.classList.remove('is-hidden');
                setTimeout(function () {
                    element.classList.remove('slide-in');
                    resolve();
                }, 250);
            });
        },
        out: (element) => {
            return new Promise(resolve => {
                element.classList.add('slide-out');
                setTimeout(function() {
                    element.classList.remove('slide-out');
                    element.classList.add('is-hidden');
                    resolve();
                }, 250);
            });
        }
    };

    function init() {
        let clearBtn = document.querySelector('#previous-sims-column button.button');
        let backBtn = document.querySelector('#back-button');
        let dlcSelectBtn = document.querySelector('#dlc-select-button');
        let randomSelectBtn = document.querySelector('#randomize-select-button');
        let trueRandomBtn = document.querySelector('#true-random-btn');
        let moodRandomBtn = document.querySelector('#mood-random-btn');
        let equalRandomBtn = document.querySelector('#equal-random-btn');

        buttonHandler.addButton('clearBtn', 'click', clearBtn, () => {
            deleteFamilyDynasty();
        });
        buttonHandler.addButton('backBtn', 'click', backBtn, () => {
            slide.out(document.querySelector('#create-a-sim'))
            .then( () => slide.in(document.querySelector('#previous-sims-column')));
        });
        buttonHandler.addButton('dlcSelectBtn', 'click', dlcSelectBtn, () => {
            let dlcSelect = document.querySelector('#dlc-select');
            let randomSelect = document.querySelector('#randomize-select');

            if(dlcSelect.classList.contains('is-hidden')) {
                dlcSelect.classList.remove('is-hidden');
                dlcSelectBtn.classList.add('is-selected');
                randomSelect.classList.add('is-hidden');
                randomSelectBtn.classList.remove('is-selected');
            } else {
                dlcSelect.classList.add('is-hidden');
                dlcSelectBtn.classList.remove('is-selected');
            }
        });
        buttonHandler.addButton('randomSelectBtn', 'click', randomSelectBtn, () => {
            let randomSelect = document.querySelector('#randomize-select');
            let dlcSelect = document.querySelector('#dlc-select');

            if(randomSelect.classList.contains('is-hidden')) {
                randomSelect.classList.remove('is-hidden');
                randomSelectBtn.classList.add('is-selected');
                dlcSelect.classList.add('is-hidden');
                dlcSelectBtn.classList.remove('is-selected');
            } else {
                randomSelect.classList.add('is-hidden');
                randomSelectBtn.classList.remove('is-selected');
                traitPool.forEach(trait => {
                    trait.isSelected = false;
                    trait.li.classList.remove('is-hidden');
                    trait.li.classList.remove('border-green');
                });
            }
        });
        buttonHandler.addButton('trueRandomBtn', 'click', trueRandomBtn, () => {
            randomizeTraits('true');
        });
        buttonHandler.addButton('moodRandomBtn', 'click', moodRandomBtn, () => {
            randomizeTraits('mood');
        });
        buttonHandler.addButton('equalRandomBtn', 'click', equalRandomBtn, () => {
            randomizeTraits('equal');
        });

        buttonHandler.getAllButtons().forEach(btn => {
            btn.bindListener();
        });

        

        let dlcBox = document.querySelector('#create-a-sim fieldset.is-grid');

        // Wait for our traits to populate, then create dlc and traits
        traitRepo.parseTraitsJSON().then(() => {
            // Populate the dlc list first
            traitRepo.getBasePacks().every(pack => {
                if(pack.name === 'basegame') {
                    return true;
                }
                dlcList.push({name: pack.name, isSelected: false});
                let div = document.createElement('div');
    
                let lbl = document.createElement('label');
                lbl.setAttribute('for', pack.name);
                lbl.innerText = (pack.name.replace(/_/g, ' ')); // Replaces all underscore characters with spaces
                lbl.style.textTransform = 'capitalize';
    
                let checkbox = document.createElement('input');
                checkbox.setAttribute('type', 'checkbox');
                checkbox.name = pack.name;
                div.appendChild(checkbox);
                div.appendChild(lbl);
                dlcBox.appendChild(div);
                div.addEventListener('click', () =>{
                    checkbox.checked = !checkbox.checked;
                    if(checkbox.checked) {
                        dlcList.forEach(dlc => {
                            if(dlc.name === checkbox.name) {
                                dlc.isSelected = true;
                            }
                        });
                    } else {
                        dlcList.forEach(dlc => {
                            if(dlc.name === checkbox.name) {
                                dlc.isSelected = false;
                            }
                        });
                    }
                    refreshTraitList();
                });
                return true;
            });
        })
        .then(() => {
            // Now populate the traits and dynasty
            refreshDynasty();
            refreshTraitList();
        });
    }

    function refreshDynasty() {
        let prevContainer = document.querySelector('#previous-sims-list');

        prevContainer.innerHTML = '';

        if(dynastyRepo.getAll().length === 0) {
            let list = document.createElement('ul');
            let text = document.createElement('li');
            text.innerText = 'Create a new sim';
            text.classList.add('button');
            text.addEventListener('click', () =>{
                slide.out(document.querySelector('#previous-sims-column'))
                .then( () => slide.in(document.querySelector('#create-a-sim')));
            });
            list.appendChild(text);
            prevContainer.appendChild(list);
            buttonHandler.getButtonByName('clearBtn').button.disabled = true;
        } else {
            let list = document.createElement('ul');
        
            dynastyRepo.getAll().reverse().forEach(member => {
                let li = document.createElement('li');
                li.classList.add('button');
                li.innerText = member.firstName + ' ' + member.lastName;
                li.addEventListener('click', () => {
                    selectSim(member, li);
                });
                list.appendChild(li);
            });
            prevContainer.appendChild(list);
            buttonHandler.getButtonByName('clearBtn').button.disabled = false;
        }
    }

    function selectSim(sim, li) {
        let list = document.querySelector('#previous-sims-list ul');
        let items = list.childNodes;
        items.forEach(item => {
            if(li !== null && sim !== null) {
                if(item.isEqualNode(li)) {
                    item.classList.add('is-selected');
                } else {
                    item.classList.remove('is-selected');
                }
            } else {
                item.classList.remove('is-selected');
            }
        });
    }

    function getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }

    function selectRandomTrait() {
        let selected = [];
        traitPool.forEach(trait => {
            if(trait.isSelected) {
                selected.push(trait);
            }
        });
        let reset = false;
        let rTrait;
        do {
            reset = false;
            let rand = getRandomInt(traitPool.length);
            rTrait = traitPool[rand];
            selected.every(select => {
                if(select.trait.name === rTrait.trait.name) {
                    reset = true;
                    return false;
                }
                else {
                    select.trait.conflicts.every(conflict => {
                        if(conflict.trait === rTrait.trait.name) {
                            reset = true;
                            return false;
                        }
                    });
                }
                return true;
            });
        } while(reset);
        rTrait.isSelected = true;
        return rTrait;
    }

    function randomizeTraits(condition) {
        if(condition.toLowerCase() === 'true') {
            traitPool.forEach(trait => {
                trait.isSelected = false;
            });
            let names = [];
            for(let i = 0; i < 3; i++) {
                names.push(selectRandomTrait().trait.name);
            }
            traitPool.forEach(trait => {
                let li = trait.li;
                li.innerHTML = trait.trait.name;
                li.classList.remove('is-hidden');
                li.classList.remove('border-green');
                if(li.innerHTML === names[0] || li.innerHTML === names[1] || li.innerHTML === names[2]) {
                    li.classList.add('border-green');
                    trait.isSelected = true;
                }
                else {
                    li.classList.add('is-hidden');
                }
            });
        } else if(condition.toLowerCase() === 'mood') {

        } else if(condition.toLowerCase === 'equal') {

        } else {
            console.warn(condition + ' is not a randomization option!');
        }
    }

    function refreshTraitList() {
        let traitList = document.querySelector('#trait-list');
        traitList.innerHTML = '';
        traitPool = [];
        traitRepo.getTraitsByBasePack('basegame').every(trait => {
            if(trait.category === 'toddler') {
                return true;
            }
            let li = document.createElement('li');
            li.classList.add('button');
            li.style.background = `white url(${trait.icon_url}) no-repeat center`;
            li.style.backgroundSize = '33.3%';

            li.innerHTML = trait.name;

            li.addEventListener('click', () => {
                if(li.innerHTML === trait.name) {
                    li.innerHTML = trait.description;
                }
                else {
                    li.innerHTML = trait.name;
                }
            });

            traitList.appendChild(li);
            traitPool.push({
                trait: trait,
                li: li,
                isSelected: false
            });
            return true;
        });
        dlcList.forEach(dlc => {
            if(dlc.isSelected) {
                traitRepo.getTraitsByBasePack(dlc.name).forEach( trait => {
                    let li = document.createElement('li');
                    li.classList.add('button');
                    li.style.background = `white url(${trait.icon_url}) no-repeat center`;
                    li.style.backgroundSize = '33.3%';
        
                    li.innerHTML += trait.name;

                    li.addEventListener('click', () => {
                        if(li.innerHTML === trait.name) {
                            li.innerHTML = trait.description;
                        } else {
                            li.innerHTML = trait.name;
                        }
                    });
        
                    traitList.appendChild(li);
                    traitPool.push({
                        trait: trait,
                        li: li,
                        isSelected: false
                    });
                });
            }
        });
        console.log(traitPool);
    }

    function deleteFamilyDynasty() {
        if(confirm('Are you sure you want to delete your legacy family?')) {
            dynastyRepo.clear();
            refreshDynasty();
        }
    }

    return {
        init: init
    }
})();

running.init();