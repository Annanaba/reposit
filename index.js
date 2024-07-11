class View {
    constructor() {
        this.app = document.getElementById('app');

        this.title = this.createElement('h1', 'title');
        this.title.textContent = 'GitHub Repository Search';

        this.searchLine = this.createElement('div', 'search-line');
        this.searchInput = this.createElement('input', 'search-input');
        this.suggestions = this.createElement('div', 'autocomplete-suggestions');
        this.searchLine.append(this.searchInput);
        this.searchLine.append(this.suggestions);

        this.repoWrapper = this.createElement('div', 'repo-wrapper');
        this.repoList = this.createElement('ul', 'repo-list');
        this.repoWrapper.append(this.repoList);

        this.main = this.createElement('div', 'main');
        this.main.append(this.repoWrapper);

        this.app.append(this.title);
        this.app.append(this.searchLine);
        this.app.append(this.main);
    }

    createElement(tag, className) {
        const element = document.createElement(tag);
        if (className) {
            element.classList.add(className);
        }
        return element;
    }

    clearSuggestions() {
        this.suggestions.innerHTML = '';
    }

    addSuggestion(repo) {
        const suggestion = this.createElement('div', 'autocomplete-suggestion');
        suggestion.textContent = repo.name;
        suggestion.dataset.repo = JSON.stringify(repo);
        this.suggestions.append(suggestion);
    }

    addRepoToList(repo) {
        const listItem = this.createElement('li', 'repo-item');
        listItem.innerHTML = `
            <span>Name: ${repo.name}<br>Owner: ${repo.owner}<br>Stars: ${repo.stars}</span>
            <button>&times;</button>
        `;
        this.repoList.append(listItem);
    }
}

class Search {
    constructor(view) {
        this.view = view;

        this.view.searchInput.addEventListener('input', this.debounce(this.searchRepos.bind(this), 300));
        this.view.suggestions.addEventListener('click', (e) => {
            if (e.target.classList.contains('autocomplete-suggestion')) {
                const repo = JSON.parse(e.target.dataset.repo);
                this.view.addRepoToList(repo);
                this.view.searchInput.value = '';
                this.view.clearSuggestions();
            }
        });

        this.view.repoList.addEventListener('click', (e) => {
            if (e.target.tagName === 'BUTTON') {
                e.target.parentElement.remove();
            }
        });
    }

    debounce(func, delay) {
        let debounceTimer;
        return function() {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => func.apply(this, arguments), delay);
        }
    }

    async searchRepos() {
        const query = this.view.searchInput.value;
        if (query.trim() === '') {
            this.view.clearSuggestions();
            return;
        }

        try {
            const response = await fetch(`https://api.github.com/search/repositories?q=${encodeURIComponent(query)}`);
            if (response.ok) {
                const data = await response.json();
                this.view.clearSuggestions();
                data.items.slice(0, 5).forEach(repo => {
                    this.view.addSuggestion({
                        name: repo.name,
                        owner: repo.owner.login,
                        stars: repo.stargazers_count
                    });
                });
            }
        } catch (error) {
            console.error('Error fetching repositories:', error);
        }
    }
}

new Search(new View());
;



