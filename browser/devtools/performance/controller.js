/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */
"use strict";

const { classes: Cc, interfaces: Ci, utils: Cu, results: Cr } = Components;

Cu.import("resource://gre/modules/Task.jsm");
Cu.import("resource://gre/modules/devtools/Loader.jsm");
Cu.import("resource:///modules/devtools/ViewHelpers.jsm");

let require = devtools.require;
devtools.lazyRequireGetter(this, "Services");
devtools.lazyRequireGetter(this, "promise");
devtools.lazyRequireGetter(this, "EventEmitter",
  "devtools/toolkit/event-emitter");
devtools.lazyRequireGetter(this, "DevToolsUtils",
  "devtools/toolkit/DevToolsUtils");
devtools.lazyRequireGetter(this, "FramerateFront",
  "devtools/server/actors/framerate", true);
devtools.lazyRequireGetter(this, "L10N",
  "devtools/profiler/global", true);
devtools.lazyImporter(this, "LineGraphWidget",
  "resource:///modules/devtools/Graphs.jsm");
devtools.lazyRequireGetter(this, "CallView",
  "devtools/profiler/tree-view", true);
devtools.lazyRequireGetter(this, "ThreadNode",
  "devtools/profiler/tree-model", true);

// Events emitted by the `PerformanceController`
const EVENTS = {
  // When a recording is started or stopped via the controller
  RECORDING_STARTED: "Performance:RecordingStarted",
  RECORDING_STOPPED: "Performance:RecordingStopped",
  // When the PerformanceActor front emits `framerate` data
  TIMELINE_DATA: "Performance:TimelineData",

  // Emitted by the PerformanceView on record button click
  UI_START_RECORDING: "Performance:UI:StartRecording",
  UI_STOP_RECORDING: "Performance:UI:StopRecording",

  // Emitted by the OverviewView when more data has been rendered
  OVERVIEW_RENDERED: "Performance:UI:OverviewRendered",

  // Emitted by the CallTreeView when a call tree has been rendered
  CALL_TREE_RENDERED: "Performance:UI:CallTreeRendered"
};

/**
 * The current target and the profiler connection, set by this tool's host.
 */
let gToolbox, gTarget, gFront;

/**
 * Initializes the profiler controller and views.
 */
let startupPerformance = Task.async(function*() {
  yield promise.all([
    PrefObserver.register(),
    PerformanceController.initialize(),
    PerformanceView.initialize()
  ]);
});

/**
 * Destroys the profiler controller and views.
 */
let shutdownPerformance = Task.async(function*() {
  yield promise.all([
    PrefObserver.unregister(),
    PerformanceController.destroy(),
    PerformanceView.destroy()
  ]);
});

/**
 * Observes pref changes on the devtools.profiler branch and triggers the
 * required frontend modifications.
 */
let PrefObserver = {
  register: function() {
    this.branch = Services.prefs.getBranch("devtools.profiler.");
    this.branch.addObserver("", this, false);
  },
  unregister: function() {
    this.branch.removeObserver("", this);
  },
  observe: function(subject, topic, pref) {
    Prefs.refresh();
  }
};

/**
 * Functions handling target-related lifetime events and
 * UI interaction.
 */
let PerformanceController = {
  /**
   * Listen for events emitted by the current tab target and
   * main UI events.
   */
  initialize: function() {
    this.startRecording = this.startRecording.bind(this);
    this.stopRecording = this.stopRecording.bind(this);
    this._onTimelineData = this._onTimelineData.bind(this);

    PerformanceView.on(EVENTS.UI_START_RECORDING, this.startRecording);
    PerformanceView.on(EVENTS.UI_STOP_RECORDING, this.stopRecording);
    gFront.on("ticks", this._onTimelineData);
  },

  /**
   * Remove events handled by the PerformanceController
   */
  destroy: function() {
    PerformanceView.off(EVENTS.UI_START_RECORDING, this.startRecording);
    PerformanceView.off(EVENTS.UI_STOP_RECORDING, this.stopRecording);
  },

  /**
   * Starts recording with the PerformanceFront. Emits `EVENTS.RECORDING_STARTED`
   * when the front is starting to record.
   */
  startRecording: Task.async(function *() {
    yield gFront.startRecording();
    this.emit(EVENTS.RECORDING_STARTED);
  }),

  /**
   * Stops recording with the PerformanceFront. Emits `EVENTS.RECORDING_STOPPED`
   * when the front stops recording.
   */
  stopRecording: Task.async(function *() {
    let results = yield gFront.stopRecording();
    this.emit(EVENTS.RECORDING_STOPPED, results);
  }),

  /**
   * Fired whenever the gFront emits a ticks, memory, or markers event.
   */
  _onTimelineData: function (eventName, ...data) {
    this.emit(EVENTS.TIMELINE_DATA, eventName, ...data);
  }
};

/**
 * Convenient way of emitting events from the controller.
 */
EventEmitter.decorate(PerformanceController);

/**
 * Shortcuts for accessing various profiler preferences.
 */
const Prefs = new ViewHelpers.Prefs("devtools.profiler", {
  showPlatformData: ["Bool", "ui.show-platform-data"]
});

/**
 * DOM query helpers.
 */
function $(selector, target = document) {
  return target.querySelector(selector);
}
function $$(selector, target = document) {
  return target.querySelectorAll(selector);
}
