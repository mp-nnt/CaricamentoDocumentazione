sap.ui.define([], function () {
	"use strict";
	return {

		editableFormatter: function (value) {
			if (value === false) {
				return true;
			} else {
				return false;
			}
		},

	};
});