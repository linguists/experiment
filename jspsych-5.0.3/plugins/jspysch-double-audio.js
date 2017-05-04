/**
 * jspsych-double-audio
 * Supawat CHOMCHAN
 * based on Josh de Leeuw's jspsych-single-audio / jspsych-same-different
 * 
 * plugin for playing an audio file and getting a keyboard response
 *
 *
 **/
jsPsych.plugins["double-audio"] = (function() {

  var plugin = {};
  var context1 = new AudioContext();
  var context2 = new AudioContext();
  jsPsych.pluginAPI.registerPreload('double-audio', 'stimuli', 'audio');

  plugin.trial = function(display_element, trial) {
    // default parameters
    trial.choices = trial.choices || [];
    trial.response_ends_trial = (typeof trial.response_ends_trial === 'undefined') ? true : trial.response_ends_trial;
    // timing parameters
    trial.timing_pre_stim = trial.timing_pre_stim || -1; // if -1, then wait for response forever
    trial.timing_first_stim = trial.timing_first_stim || -1; // if -1, then wait for response forever
    trial.timing_second_stim = trial.timing_second_stim || -1; // if -1, then wait for response forever
    trial.timing_gap = trial.timing_gap || -1; // if -1, then wait for response forever
    trial.timing_response = trial.timing_response || -1; // if -1, then wait for response forever
	// prompt

    trial.prompt = (typeof trial.prompt === 'undefined') ? "" : trial.prompt;
    // if any trial variables are functions
    // this evaluates the function and replaces
    // it with the output of the function
    trial = jsPsych.pluginAPI.evaluateFunctionParameters(trial);
    // this array holds handlers from setTimeout calls
    // that need to be cleared if the trial ends early
    var setTimeoutHandlers = [];
    // play stimulus
    var source1 = context1.createBufferSource();
    source1.buffer = jsPsych.pluginAPI.getAudioBuffer(trial.stimuli[0]);
    source1.connect(context1.destination);
    startTime1 = context1.currentTime + 0.1 + trial.timing_pre_stim/1000;
    source1.start(startTime1);

	var source2 = context2.createBufferSource();
    source2.buffer = jsPsych.pluginAPI.getAudioBuffer(trial.stimuli[1]);
    source2.connect(context2.destination);
    startTime2 = context2.currentTime + 0.1 + trial.timing_gap/1000 + trial.timing_first_stim/1000 + trial.timing_pre_stim/1000;
    source2.start(startTime2);
    // show prompt if there is one

    if (trial.prompt !== "") {
      display_element.append(trial.prompt);
    }
    // store response
    var response = {
      rt: -1,
      key: -1
    };
    // function to end trial when it is time
    var end_trial = function() {

      // kill any remaining setTimeout handlers
      for (var i = 0; i < setTimeoutHandlers.length; i++) {
        clearTimeout(setTimeoutHandlers[i]);
      }
      // stop the audio file if it is playing
	 if (response.rt < 0) {source1.stop();source2.stop();}
	 else {source2.stop();}
      // kill keyboard listeners
      jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);
      // gather the data to store for the trial
      var trial_data = {
        "rt": response.rt * 1000,
        "stimulus": trial.audio_path,
        "key_press": response.key
      };
      // clear the display
      display_element.html('');
      // move on to the next trial
      jsPsych.finishTrial(trial_data);
    };
    // function to handle responses by the subject
    var after_response = function(info) {
      // only record the first response
      if (response.key == -1) {
        response = info;
      }
      if (trial.response_ends_trial) {
        end_trial();
      }
    };
    // start the response listener
    var keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
      callback_function: after_response,
      valid_responses: trial.choices,
      rt_method: 'audio',
      persist: false,
      allow_held_key: false,
      audio_context: context2,
      audio_context_start_time: startTime2
    });
    // end trial if time limit is set
    if (trial.timing_response > 0) {
      var t2 = setTimeout(function() {
        end_trial();
      }, trial.timing_response);
      setTimeoutHandlers.push(t2);
    }
  };
  return plugin;
})();
