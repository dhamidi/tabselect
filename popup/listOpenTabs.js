let browser = null;
if ('browser' in window) { browser = window.browser; }
if ('chrome' in window)  { browser = window.chrome;  }
let searchBox = document.getElementById("q");
let results = document.getElementById("results");
let template = document.getElementById("result-item-template");
let currentState = null;

function listTabs(then) {
    try {
	browser.tabs.query({currentWindow: true}).then(then);
    } catch(_) {
	browser.tabs.query({currentWindow: true}, then);
    }
}

function state(openTabs) {
    return {
	searchTerm: new RegExp(''),
	openTabs: openTabs,
	matchingTabs: [],
	selectedTabIndex: 0
    }
}

function changeSearchTerm(state, newSearchTerm) {
    return {
	...state,
	searchTerm: new RegExp(newSearchTerm, 'iu'),
	selectedTabIndex: 0
    }
}

function search(state) {
    let matchingTabs = []
    for (let openTab of state.openTabs) {
	if (state.searchTerm.test(openTab.title)) {
	    matchingTabs.push(openTab)
	}
    }

    return { ...state, matchingTabs };
}

function tabResult(tab) {
    let item = template.content.cloneNode(true);
    item.querySelector('.tab-name').innerText = tab.title;
    item.querySelector('.result-item').dataset.tabId = tab.id;
    return item;
}

function selectResult(tabResult) {
    tabResult.querySelector('.result-item').classList.add('selected');
}

function selectNext(state) {
    if (state.selectedTabIndex === state.matchingTabs.length-1) {
	return state;
    }

    return { ...state, selectedTabIndex: state.selectedTabIndex + 1 };
}

function selectPrevious(state) {
    if (state.selectedTabIndex === 0) {
	return state;
    }

    return { ...state, selectedTabIndex: state.selectedTabIndex - 1 };
}

function goToSelectedTab(state) {
    let matchingTab = state.matchingTabs[state.selectedTabIndex];
    browser.tabs.update(matchingTab.id, { active: true });
    window.close();
}

function render(state) {
    results.innerHTML = '';
    let index = 0;
    for (let tab of state.matchingTabs) {
	let result = tabResult(tab);
	if (index === state.selectedTabIndex) {
	    selectResult(result);
	}
	results.appendChild(result);
	index++;
    }
}

listTabs(function (tabs) {
    currentState = state(tabs);
    render(currentState);
});

document.addEventListener('keydown', function(event) {
    console.log(event.key);
    if (!event.shiftKey && event.key === 'Tab') {
	event.preventDefault();
	currentState = selectNext(currentState);
	render(currentState);
    }
    if (event.shiftKey && event.key === 'Tab') {
	event.preventDefault();
	currentState = selectPrevious(currentState);
	render(currentState);
    }
    if (event.key === 'Enter') {
	goToSelectedTab(currentState);
    }
});
searchBox.addEventListener('input', function(event) {
    currentState = changeSearchTerm(currentState, searchBox.value);
    currentState = search(currentState);
    render(currentState);
});			
