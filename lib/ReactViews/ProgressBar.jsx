'use strict';

import React from 'react';
import EventHelper from 'terriajs-cesium/Source/Core/EventHelper';
import classnames from 'classnames';

// The map navigation region
const MapNavigation = React.createClass({
    propTypes: {
        terria: React.PropTypes.object.isRequired
    },

    getInitialState() {
        return {
            visible: 'hidden'
        };
    },

    componentWillMount() {
        this.eventHelper = new EventHelper();

        this.eventHelper.add(this.props.terria.tileLoadProgressEvent, this.setProgress);

        // Clear progress when the viewer changes so we're not left with an invalid progress bar hanging on the screen.
        this.eventHelper.add(this.props.terria.beforeViewerChanged, this.setProgress.bind(this, 0, 0));
    },

    setProgress(remaining, max) {
        const rawPercentage = (1 - (remaining / max)) * 100;
        const sanitisedPercentage = Math.floor(remaining > 0 ? rawPercentage : 100);

        this.setState({
            percentage: sanitisedPercentage
        });
    },

    componentWillUnmount() {
        this.eventHelper.removeAll();
    },

    render() {
        const width = this.state.percentage + '%';
        const visibility = this.state.percentage < 100 ? 'visible' : 'hidden';
        const complete = this.state.percentage === 100;

        return (
            <div className={classnames('map-progress-bar', {'map-progress-bar--complete': complete})} style={{visibility, width}} />
        );
    }
});
module.exports = MapNavigation;