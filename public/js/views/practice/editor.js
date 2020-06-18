'use strict';
require.config({
	baseUrl: '/library/manacoEditor/'
	//baseUrl: 'https://microsoft.github.io/monaco-editor/node_modules/monaco-editor/min/'

});


var editor = null, diffEditor = null;

$(document).ready(function () {
	require(['vs/editor/editor.main'], function () {
		var MODES = (function () {
			var modesIds = monaco.languages.getLanguages().map(function (lang) { return lang.id; });
			modesIds.sort();

			return modesIds.map(function (modeId) {
				return {
					modeId: modeId,
					sampleURL: 'https://microsoft.github.io/monaco-editor/index/samples/sample.' + modeId + '.txt'
					// sampleURL: '/library/manacoEditor/samples/sample.' + modeId + '.txt'
				};
			});
		})();

		//only compile c
		var temp = [];
		var complanguage = [ 'cpp', 'java', 'javascript', 'php', 'python'];
		temp = MODES.filter(x => { return complanguage.includes(x.modeId) });
		MODES = temp;
		for (var i = 0; i < MODES.length; i++) {
			var o = document.createElement('option');
			o.textContent = MODES[i].modeId;
			$(".language-picker").append(o);
		}
		$(".language-picker").change(function () {
			loadSample(MODES[this.selectedIndex]);
		});
		$('.language-picker').selectpicker({
			size: 10
		});
		loadSample(MODES[0]);

		$(".theme-picker").change(function () {
			changeTheme(this.selectedIndex);
		});
		$('.theme-picker').selectpicker({
			size: 3
		});

		// loadDiffSample();

		$('#inline-diff-checkbox').change(function () {
			diffEditor.updateOptions({
				renderSideBySide: !$(this).is(':checked')
			});
		});
	});

	window.onresize = function () {
		if (editor) {
			editor.layout();
		}
		if (diffEditor) {
			diffEditor.layout();
		}
	};


	$('#current-breadcrumb').append('<li class="breadcrumb-item">Problem</li>');//sub header
	$('#current-breadcrumb').append('<li class="breadcrumb-item">'+$(".problem-title").html()+'</li>');
	// handler when submit code
	$("#submit-answer").click(function () {

		if (editor.getValue().length == 0) {
			return false;
		}
		else {
			var code = editor.getValue(),
				problem = $(".problem-title").html(),
				username = localStorage.getItem('username'),
				language = $('.language-picker option:selected').text();
			// var data = {
			// 	code: code,
			// 	problem: problem,
			// 	username: username,
			// 	language: language
			// }
			$("#inp-username").val(username);
			$("#inp-problem").val(problem);
			$("#inp-language").val(language);
			$("#inp-code").val(code);
			// $.ajax({
			// 	type: 'POST',
			// 	url: '/submit',
			// 	dataType: 'application/json',
			// 	data: JSON.stringify(data)

			// }).done(function (data) {
			// 	lhsData = data;
			// 	onProgress();
			// });
		}
	})

});

function loadSample(mode) {
	$.ajax({
		type: 'GET',
		url: mode.sampleURL,
		dataType: 'text',
		beforeSend: function () {
			$('.loading.editor').show();
		},
		error: function () {
			if (editor) {
				if (editor.getModel()) {
					editor.getModel().dispose();
				}
				editor.dispose();
				editor = null;
			}
			$('.loading.editor').fadeOut({ duration: 200 });
			$('#editor').empty();
			$('#editor').append('<p class="alert alert-error">Failed to load ' + mode.modeId + ' sample</p>');





		}
	}).done(function (data) {
		if (!editor) {
			$('#editor').empty();
			editor = monaco.editor.create(document.getElementById('editor'), {
				model: null,
			});
		}

		var oldModel = editor.getModel();
		var newModel = monaco.editor.createModel(data, mode.modeId);
		editor.setModel(newModel);
		if (oldModel) {
			oldModel.dispose();
		}
		$('.loading.editor').fadeOut({ duration: 300 });
	});
}

// function loadDiffSample() {

// 	var onError = function() {
// 		$('.loading.diff-editor').fadeOut({ duration: 200 });
// 		$('#diff-editor').append('<p class="alert alert-error">Failed to load diff editor sample</p>');
// 	};

// 	$('.loading.diff-editor').show();

// 	var lhsData = null, rhsData = null, jsMode = null;

// 	// $.ajax({
// 	// 	type: 'GET',
// 	// 	url: 'https://microsoft.github.io/monaco-editor/index/samples/diff.lhs.txt',
// 	// 	dataType: 'text',
// 	// 	error: onError
// 	// }).done(function (data) {
// 	// 	lhsData = data;
// 	// 	onProgress();
// 	// });

// 	// $.ajax({
// 	// 	type: 'GET',
// 	// 	url: 'https://microsoft.github.io/monaco-editor/index/samples/diff.rhs.txt',
// 	// 	dataType: 'text',
// 	// 	error: onError
// 	// }).done(function (data) {
// 	// 	rhsData = data;
// 	// 	onProgress();
// 	// });

// 	function onProgress() {
// 		if (lhsData && rhsData) {
// 			diffEditor = monaco.editor.createDiffEditor(document.getElementById('diff-editor'), {
// 				enableSplitViewResizing: false
// 			});

// 			var lhsModel = monaco.editor.createModel(lhsData, 'text/javascript');
// 			var rhsModel = monaco.editor.createModel(rhsData, 'text/javascript');

// 			diffEditor.setModel({
// 				original: lhsModel,
// 				modified: rhsModel
// 			});

// 			$('.loading.diff-editor').fadeOut({ duration: 300 });
// 		}
// 	}
// }

function changeTheme(theme) {
	var newTheme = (theme === 1 ? 'vs-dark' : (theme === 0 ? 'vs' : 'hc-black'));


	try {
		monaco.editor.setTheme(newTheme);
	}
	catch (err) {
		console.log(err);
	}


	// if (editor) {
	// 	editor.updateOptions({ 'theme' : newTheme });
	// }
	// if (diffEditor) {
	// 	diffEditor.updateOptions({ 'theme': newTheme });
	// }
}

