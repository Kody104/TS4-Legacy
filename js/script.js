const traitRepo = (function() {

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
        {
            firstName: 'Jeff',
            lastName: 'Lowe',
            age: 'Elder',
            traits: ['Hot-Headed', 'Self-Assured', 'Ambitious']
        }
    ];

    function createSim(firstName, lastName, traitList, age) {
        return {
            firstName: firstName,
            lastName: lastName,
            age: age,
            traits: traitList
        }
    }

    function getAll() {
        return members;
    }

    function addMember(member) {
        members.push(member);
    }

    function deleteMember(index) {
        members.splice(index, 1);
    }

    function clear() {
        members = [];
    }

    return {
        createSim: createSim,
        getAll: getAll,
        addMember: addMember,
        deleteMember: deleteMember,
        clear: clear
    }
})();
const running = (function() {

    const dlcList = [];
    let traitPool = [];

    const buttonHandler = (function() {
        const items = [];

        function addButton(name, eventType, button, fnct) {
            items.push({
                name: name,
                button: button,
                fnct: fnct,
                bindListener: function() {
                    button.addEventListener(eventType, fnct);
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

    const slide = {
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
        const clearBtn = document.querySelector('#previous-sims-column button.button');
        const backBtnOne = document.querySelector('#back-button-one');
        const backBtnTwo = document.querySelector('#back-button-two');
        const saveBtn = document.querySelector('#save-button');
        const dlcSelectBtn = document.querySelector('#dlc-select-button');
        const randomSelectBtn = document.querySelector('#randomize-select-button');
        const trueRandomBtn = document.querySelector('#true-random-btn');
        const moodRandomBtn = document.querySelector('#mood-random-btn');
        const equalRandomBtn = document.querySelector('#equal-random-btn');

        buttonHandler.addButton('clearBtn', 'click', clearBtn, () => {
            deleteFamilyDynasty();
        });
        buttonHandler.addButton('backBtn1', 'click', backBtnOne, () => {
            slide.out(document.querySelector('#create-a-sim'))
            .then( () => slide.in(document.querySelector('#previous-sims-column')));
        });
        buttonHandler.addButton('backBtn2', 'click', backBtnTwo, () => {
            slide.out(document.querySelector('#edit-sim'))
            .then( () => slide.in(document.querySelector('#previous-sims-column')));
        });
        buttonHandler.addButton('saveBtn', 'click', saveBtn, () => {
            if(!saveFamilyDynasty()) {
                console.warn('Didn\'t save the family!');
            }
        });
        buttonHandler.addButton('dlcSelectBtn', 'click', dlcSelectBtn, () => {
            const dlcSelect = document.querySelector('#dlc-select');
            const randomSelect = document.querySelector('#randomize-select');

            if(dlcSelect.classList.contains('is-hidden')) {
                dlcSelect.classList.remove('is-hidden');
                dlcSelectBtn.classList.add('is-selected');
                randomSelect.classList.add('is-hidden');
                randomSelectBtn.classList.remove('is-selected');
                traitPool.forEach(trait => {
                    trait.isSelected = false;
                    trait.li.classList.remove('is-hidden');
                    trait.li.classList.remove('border-green');
                });
                document.querySelector('#save-button').classList.add('is-hidden');
            } else {
                dlcSelect.classList.add('is-hidden');
                dlcSelectBtn.classList.remove('is-selected');
            }
        });
        buttonHandler.addButton('randomSelectBtn', 'click', randomSelectBtn, () => {
            const randomSelect = document.querySelector('#randomize-select');
            const dlcSelect = document.querySelector('#dlc-select');

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
                document.querySelector('#save-button').classList.add('is-hidden');
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

        

        const dlcBox = document.querySelector('#create-a-sim fieldset.is-grid');

        const d = document.createElement('div');

        const l = document.createElement('label');
        l.setAttribute('for', 'all packs');
        l.innerText = 'All Packs';

        const c = document.createElement('input');
        c.setAttribute('type', 'checkbox');
        c.name = 'all_packs';

        const checkFnc = function() {
            c.checked = !c.checked;
            if(c.checked) {
                const boxes = document.querySelectorAll('div.dlc-item');
                boxes.forEach(node => {
                    node.childNodes[0].checked = true;
                    dlcList.forEach(dlc => {
                        dlc.isSelected = true;
                    });
                });
            }
            else {
                const boxes = document.querySelectorAll('div.dlc-item');
                boxes.forEach(node => {
                    node.childNodes[0].checked = false;
                    dlcList.forEach(dlc => {
                        dlc.isSelected = false;
                    });
                });
            }
            refreshTraitList();
        };

        c.addEventListener('click', checkFnc);

        d.appendChild(c);
        d.appendChild(l);
        d.addEventListener('click', checkFnc);

        dlcBox.appendChild(d);

        // Wait for our traits to populate, then create dlc and traits
        traitRepo.parseTraitsJSON().then(() => {
            // Populate the dlc list first
            traitRepo.getBasePacks().every(pack => {
                if(pack.name === 'basegame') {
                    return true;
                }
                dlcList.push({name: pack.name, isSelected: false});
                const div = document.createElement('div');
                div.classList.add('dlc-item');
    
                const lbl = document.createElement('label');
                lbl.setAttribute('for', pack.name);
                lbl.innerText = (pack.name.replace(/_/g, ' ')); // Replaces all underscore characters with spaces
                lbl.style.textTransform = 'capitalize';
    
                const checkbox = document.createElement('input');
                checkbox.setAttribute('type', 'checkbox');
                checkbox.name = pack.name;

                const fnc = function() {
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
                };

                checkbox.addEventListener('click', fnc);

                div.appendChild(checkbox);
                div.appendChild(lbl);
                dlcBox.appendChild(div);
                div.addEventListener('click', fnc);

                

                //TODO: Pull from cache if necessary, create if necessary

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
        const prevContainer = document.querySelector('#previous-sims-list');

        prevContainer.innerHTML = '';

        if(dynastyRepo.getAll().length === 0) {
            const list = document.createElement('ul');
            const text = document.createElement('li');
            text.innerText = 'Create a new sim';
            text.classList.add('button');
            text.classList.add('border-green');
            text.addEventListener('click', () =>{
                slide.out(document.querySelector('#previous-sims-column'))
                .then( () =>  slide.in(document.querySelector('#create-a-sim')));
            });
            list.appendChild(text);
            prevContainer.appendChild(list);
            buttonHandler.getButtonByName('clearBtn').button.disabled = true;
        } else {
            const list = document.createElement('ul');
        
            dynastyRepo.getAll().reverse().forEach(member => {
                const li = document.createElement('li');
                li.classList.add('button');
                li.innerText = member.firstName + ' ' + member.lastName;
                li.addEventListener('click', () => {
                    selectSim(member);
                    slide.out(document.querySelector('#previous-sims-column'))
                    .then( () => slide.in(document.querySelector('#edit-sim')))
                });
                list.appendChild(li);
            });
            const text = document.createElement('li');
            text.innerText = 'Create a new sim';
            text.classList.add('button');
            text.classList.add('border-green');
            text.addEventListener('click', () =>{
                slide.out(document.querySelector('#previous-sims-column'))
                .then( () => slide.in(document.querySelector('#create-a-sim')));
            });
            list.appendChild(text);
            prevContainer.appendChild(list);
            buttonHandler.getButtonByName('clearBtn').button.disabled = false;
        }
    }

    function selectSim(member) {
        const title = document.querySelector('#edit-sim h1.column-title');
        title.innerText = `${member.firstName} ${member.lastName}`;
        const curCycle = document.querySelector('#edit-sim h2.column-title');
        curCycle.innerText = `Age: ${member.age}`;
        const traitContainer = document.querySelector('#selected-sim-traits ul.trait-list');
        traitContainer.innerHTML = '';
        member.traits.forEach(trait => {
            const li = document.createElement('li');
            const tObj = traitRepo.getTraitByName(trait);
            li.classList.add('button');
            li.style.background = `white url(${tObj.icon_url}) no-repeat center`;
            li.style.backgroundSize = '33.3%';
            li.innerHTML = tObj.name;

            li.addEventListener('click', () => {
                if(!li.innerHTML.includes('<br>')) {
                    li.innerHTML = `<span style="color: var(--color-blue);">Name</span>: ${tObj.name}<br><span style="color: var(--color-blue);">Description</span>: ${tObj.description}
                    <br><span style="color: var(--color-blue);">Category</span>: <span style="text-transform: capitalize;">${tObj.category}</span>`;
                }
                else {
                    li.innerHTML = tObj.name;
                }
            });

            traitContainer.appendChild(li);
        });
    }

    function getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }

    function selectRandomTrait(category, exclude) {
        const selected = [];
        const pool = [];
        traitPool.forEach(trait => {
            if(trait.isSelected) { // If the trait is already selected, skip adding it to the selection pool
                selected.push(trait);
            } else if(arguments.length == 2) { // If we have given parameters, check according to them
                if(!exclude) { // We are only looking for this category of traits
                    if(trait.trait.category === category) {
                        pool.push(trait);
                    }
                } else if(exclude) { // We want everything that's not this category
                    if(trait.trait.category !== category) {
                        pool.push(trait);
                    }
                }
            }
            else if(arguments.length == 0) { // If there are no parameters given, we just push
                pool.push(trait);
            }
            else { // Unknown paramters given
                console.warn('Unknown paramters given.');
            }
        });
        let reset = false;
        let rTrait;
        do {
            reset = false;
            const rand = getRandomInt(pool.length);
            rTrait = pool[rand];
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
        return rTrait;
    }

    function randomizeTraits(condition) {
        traitPool.forEach(trait => {
            trait.isSelected = false;
        });
        const names = [];
        if(condition.toLowerCase() === 'true') {
            for(let i = 0; i < 3; i++) {
                const rTrait = selectRandomTrait();
                rTrait.isSelected = true;
                names.push(rTrait.trait.name);
            }
            traitPool.forEach(trait => {
                const li = trait.li;
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
            for(let i = 0; i < 3; i++) {
                let rTrait;
                if(i === 0) { // Only the first trait needs to be emotional
                    rTrait = selectRandomTrait('emotional', false);
                    rTrait.isSelected = true;
                    names.push(rTrait.trait.name);
                }
                else { // Exclude emotional from the rest
                    rTrait = selectRandomTrait('emotional', true);
                    rTrait.isSelected = true;
                    names.push(rTrait.trait.name);
                }
            }
            traitPool.forEach(trait => {
                const li = trait.li;
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

        } else if(condition.toLowerCase() === 'equal') {
            const selected = [];
            for(let i = 0; i < 3; i++) {
                const rTrait = selectRandomTrait();
                let mustBreak = false;
                selected.forEach(select => {
                    if(select.trait.category === rTrait.trait.category) {
                        mustBreak = true;
                    }
                });
                if(mustBreak) {
                    i--;
                    continue;
                }
                selected.push(rTrait);
                rTrait.isSelected = true;
                names.push(rTrait.trait.name);
            }
            traitPool.forEach(trait => {
                const li = trait.li;
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
        } else {
            console.warn(condition + ' is not a randomization option!');
            return;
        }
        document.querySelector('#save-button').classList.remove('is-hidden');
    }

    function refreshTraitList() {
        const traitList = document.querySelector('#trait-list');
        traitList.innerHTML = '';
        traitPool = [];
        traitRepo.getTraitsByBasePack('basegame').every(trait => {
            if(trait.category === 'toddler') {
                return true;
            }
            const li = document.createElement('li');
            li.classList.add('button');
            li.style.background = `white url(${trait.icon_url}) no-repeat center`;
            li.style.backgroundSize = '33.3%';

            li.innerHTML = trait.name;

            li.addEventListener('click', () => {
                if(!li.innerHTML.includes('<br>')) {
                    li.innerHTML = `<span style="color: var(--color-blue);">Name</span>: ${trait.name}<br><span style="color: var(--color-blue);">Description</span>: ${trait.description}
                    <br><span style="color: var(--color-blue);">Category</span>: <span style="text-transform: capitalize;">${trait.category}</span>`;
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
                    const li = document.createElement('li');
                    li.classList.add('button');
                    li.style.background = `white url(${trait.icon_url}) no-repeat center`;
                    li.style.backgroundSize = '33.3%';
        
                    li.innerHTML += trait.name;

                    li.addEventListener('click', () => {
                        if(!li.innerHTML.includes('<br>')) {
                            li.innerHTML = `<span style="color: var(--color-blue);">Name</span>: ${trait.name}<br><span style="color: var(--color-blue);">Description</span>: ${trait.description}
                            <br><span style="color: var(--color-blue);">Category</span>: <span style="text-transform: capitalize;">${trait.category}</span>`;
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
    }

    function saveFamilyDynasty() {
        const simName = document.querySelectorAll('#sim-form input');
        if(!simName[0].value) {
            if(simName[0].style.border) {
                return true;
            }
            simName[0].style.border = '2px solid red';
            const errDiv = document.createElement('div');
            errDiv.style.border = '2px solid red';
            errDiv.appendChild(document.createTextNode('You need a first name!'));
            simName[0].after(errDiv);
            setTimeout(() => {
                errDiv.remove();
                simName[0].style.border = '';
            }, 3000);
            return true;
        } else if(!simName[1].value) {
            if(simName[1].style.border) {
                return true;
            }
            simName[1].style.border = '2px solid red';
            const errDiv = document.createElement('div');
            errDiv.style.border = '2px solid red';
            errDiv.appendChild(document.createTextNode('You need a last name!'));
            simName[1].after(errDiv);
            setTimeout(() => {
                errDiv.remove();
                simName[1].style.border = '';
            }, 3000);
            return true;
        } else {
            const selected = [];
            traitPool.forEach(trait => {
                if(trait.isSelected) {
                    selected.push(trait.trait.name); // Beautiful trait name
                }
            });
            if(selected.length !== 3) {
                const subtitle = document.querySelector('#create-a-sim h3.subtitle');
                const errDiv = document.createElement('div');
                errDiv.style.border = '2px solid red';
                errDiv.appendChild(document.createTextNode(`Error: trait length = ${selected.length}`));
                subtitle.before(errDiv);
                setTimeout(() => {
                    errDiv.remove();
                }, 3000);
            return false;
            } else {
                const familyMember = dynastyRepo.createSim(simName[0].value, simName[1].value, selected, 'Young Adult');
                let mustBreak = false;
                dynastyRepo.getAll().forEach(member => {
                    if(member.firstName.toLowerCase() === familyMember.firstName.toLowerCase() &&
                        member.lastName.toLowerCase() === familyMember.lastName.toLowerCase()) {
                            const decision =  confirm(`It looks like ${familyMember.firstName} ${familyMember.lastName} has already been added in this family. Are you sure you want to add another?`);
                            if(!decision) {
                                mustBreak = true;
                            }
                        }
                });
                if(mustBreak) {
                    return true;
                }
                dynastyRepo.addMember(familyMember);
                refreshDynasty();
                const subtitle = document.querySelector('#create-a-sim h3.subtitle');
                const successDiv = document.createElement('div');
                successDiv.style.border = '2px solid green';
                successDiv.appendChild(document.createTextNode(`${familyMember.firstName}
                 ${familyMember.lastName} has been saved!`));
                subtitle.before(successDiv);
                setTimeout(() => {
                    successDiv.remove();
                    slide.out(document.querySelector('#create-a-sim'))
                    .then( () => slide.in(document.querySelector('#previous-sims-column')));
                }, 1000);
                return true;
            }
        }
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