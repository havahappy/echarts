define(function (require) {

    var ComponentView = require('../../view/Component');

    return ComponentView.extend({

        type: 'dataZoom',

        render: function (dataZoomModel, ecModel, api, payload) {
            this.dataZoomModel = dataZoomModel;
            this.ecModel = ecModel;
            this.api = api;
        },

        /**
         * Find the first target coordinate system.
         *
         * @protected
         * @return {Object} {
         *                   cartesian: [
         *                       {model: coord0, axisModels: [axis1, axis3], coordIndex: 1},
         *                       {model: coord1, axisModels: [axis0, axis2], coordIndex: 0},
         *                       ...
         *                   ],  // cartesians must not be null/undefined.
         *                   polar: [
         *                       {model: coord0, axisModels: [axis4], coordIndex: 0},
         *                       ...
         *                   ],  // polars must not be null/undefined.
         *                   singleAxis: [
         *                       {model: coord0, axisModels: [], coordIndex: 0}
         *                   ]
         */
        getTargetCoordInfo: function () {
            var dataZoomModel = this.dataZoomModel;
            var ecModel = this.ecModel;
            var coordSysLists = {
                cartesian: [],
                polar: [],
                singleAxis: []
            };

            dataZoomModel.eachTargetAxis(function (dimNames, axisIndex) {
                var axisModel = ecModel.getComponent(dimNames.axis, axisIndex);
                if (axisModel) {
                    var coordSysName;
                    var axisName = dimNames.axis;

                    if (axisName === 'xAxis' || axisName === 'yAxis') {
                        coordSysName = 'grid';
                    }
                    else if (axisName === 'angleAxis' || axisName === 'radiusAxis') {
                        coordSysName = 'polar';
                    }
                    else if (axisName === 'singleAxis') {
                        coordSysName = 'singleAxis';
                    }

                    var coordModel = coordSysName
                        ? ecModel.queryComponents({
                            mainType: coordSysName,
                            index: axisModel.get(coordSysName + 'Index'),
                            id: axisModel.get(coordSysName + 'Id')
                        })[0]
                        : null;

                    if (coordModel != null) {
                        save(
                            coordModel,
                            axisModel,
                            coordSysLists[coordSysName] || [],
                            coordModel.componentIndex
                        );
                    }
                }
            }, this);

            function save(coordModel, axisModel, store, coordIndex) {
                var item;
                for (var i = 0; i < store.length; i++) {
                    if (store[i].model === coordModel) {
                        item = store[i];
                        break;
                    }
                }
                if (!item) {
                    store.push(item = {
                        model: coordModel, axisModels: [], coordIndex: coordIndex
                    });
                }
                item.axisModels.push(axisModel);
            }

            return coordSysLists;
        }

    });

});