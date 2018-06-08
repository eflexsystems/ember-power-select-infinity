import PowerSelect from 'ember-power-select/components/power-select';
import { countOptions } from 'ember-power-select/utils/group-utils';
import { get } from '@ember/object';
import { tryInvoke } from '@ember/utils';
import { isBlank } from '@ember/utils';

export default PowerSelect.extend({
    mustShowSearchMessage: false,
    actions: {
        search(term) {
          if (isBlank(term)) {
              this.updateState({
                  results: get(this, 'options'),
                  _rawSearchResults: get(this, 'options'),
                  resultsCount: countOptions(get(this, 'options')),
                  lastSearchedText: "",
                  loading: false
              });
          } else if (this.get('search')) {
            this._performSearch(term);
          } else {
            this._performFilter(term);
          }
        },
        onScroll() {
            this.updateState({ loading: true });
            let term = get(this, 'publicAPI.lastSearchedText');
            let currentResults = get(this, 'publicAPI.results');
            tryInvoke(this, 'loadMore', [term, get(this, 'publicAPI')]).then(results => {
                let plainArray = results.toArray ? results.toArray() : results;
                let newResults = currentResults.concat(plainArray);
                this.updateState({
                    results: newResults,
                    _rawSearchResults: newResults,
                    resultsCount: countOptions(plainArray),
                    lastSearchedText: term,
                    loading: false
                });
                this.resetHighlighted();
            }).catch(() => {
                this.updateState({ lastSearchedText: term, loading: false });
            });
        }
    },
    init() {
        this._super(...arguments);
        this._publicAPIActions.onScroll = (...args) => this.send('onScroll', ...args);
    }
});