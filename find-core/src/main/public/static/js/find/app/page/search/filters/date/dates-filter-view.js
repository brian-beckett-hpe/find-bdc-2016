define([
    'backbone',
    'jquery',
    'underscore',
    'moment',
    'i18n!find/nls/bundle',
    'find/app/model/dates-filter-model',
    'js-whatever/js/list-view',
    'text!find/templates/app/page/search/filters/date/dates-filter-view.html',
    'bootstrap-datetimepicker'
], function(Backbone, $, _, moment, i18n, DatesFilterModel, ListView, template) {

    var DATES_DISPLAY_FORMAT = 'YYYY/MM/DD HH:mm';

    var html = _.template(template)({
        i18n: i18n,
        customFilterData: [
            {headingKey: 'app.from', targetAttribute: 'customMinDate'},
            {headingKey: 'app.until', targetAttribute: 'customMaxDate'}
        ],
        filters: [
            DatesFilterModel.DateRange.WEEK,
            DatesFilterModel.DateRange.MONTH,
            DatesFilterModel.DateRange.YEAR,
            DatesFilterModel.DateRange.CUSTOM
        ]
    });

    function dateUpdater(attribute) {
        return function() {
            var display = '';
            var value = this.datesFilterModel.get(attribute);

            if (value) {
                display = value.format(DATES_DISPLAY_FORMAT);
            }

            this.$('[data-date-attribute="' + attribute + '"]').find('input').val(display);
        };
    }

    return Backbone.View.extend({
        events: {
            'click tr': function(event) {
                var $targetRow = $(event.currentTarget);
                var selected = $targetRow.attr('data-filter-id');
                var previous = this.datesFilterModel.get('dateRange');

                if (selected === previous) {
                    this.datesFilterModel.set('dateRange', null);
                } else {
                    this.datesFilterModel.set('dateRange', selected);
                }
            },
            'dp.change .results-filter-date[data-date-attribute]': function(event) {
                var attributes = {dateRange: DatesFilterModel.DateRange.CUSTOM};
                attributes[$(event.target).attr('data-date-attribute')] = event.date;
                this.datesFilterModel.set(attributes);
            }
        },

        initialize: function(options) {
            this.datesFilterModel = options.datesFilterModel;

            this.listenTo(this.datesFilterModel, 'change:dateRange', this.updateForDateRange);
            this.listenTo(this.datesFilterModel, 'change:customMaxDate', this.updateMaxDate);
            this.listenTo(this.datesFilterModel, 'change:customMinDate', this.updateMinDate);
        },

        render: function() {
            this.$el.html(html);

            this.$('.results-filter-date').datetimepicker({
                format: DATES_DISPLAY_FORMAT,
                icons: {
                    time: 'hp-icon hp-fw hp-clock',
                    date: 'hp-icon hp-fw hp-calendar',
                    up: 'hp-icon hp-fw hp-chevron-up',
                    down: 'hp-icon hp-fw hp-chevron-down',
                    next: 'hp-icon hp-fw hp-chevron-right',
                    previous: 'hp-icon hp-fw hp-chevron-left'
                }
            });

            this.updateForDateRange();
            this.updateMinDate();
            this.updateMaxDate();
        },

        updateMinDate: dateUpdater('customMinDate'),
        updateMaxDate: dateUpdater('customMaxDate'),

        updateForDateRange: function() {
            var dateRange = this.datesFilterModel.get('dateRange');

            // Clear all checkboxes, check selected
            this.$('.date-filters-list i').addClass('hide');
            this.$('.date-filters-list [data-filter-id="' + dateRange + '"] i').removeClass('hide');

            // If custom show custom options
            this.$('.search-dates-wrapper').toggleClass('hide', dateRange !== DatesFilterModel.DateRange.CUSTOM);
        }
    });

});
