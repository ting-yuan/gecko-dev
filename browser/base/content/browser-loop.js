// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

// the "exported" symbols
let LoopUI;

XPCOMUtils.defineLazyModuleGetter(this, "injectLoopAPI", "resource:///modules/loop/MozLoopAPI.jsm");
XPCOMUtils.defineLazyModuleGetter(this, "MozLoopService", "resource:///modules/loop/MozLoopService.jsm");
XPCOMUtils.defineLazyModuleGetter(this, "PanelFrame", "resource:///modules/PanelFrame.jsm");


(function() {
  LoopUI = {
    get toolbarButton() {
      delete this.toolbarButton;
      return this.toolbarButton = CustomizableUI.getWidget("loop-button").forWindow(window);
    },

    /**
     * Opens the panel for Loop and sizes it appropriately.
     *
     * @param {event} event The event opening the panel, used to anchor
     *                      the panel to the button which triggers it.
     */
    openCallPanel: function(event) {
      let callback = iframe => {
        iframe.addEventListener("DOMContentLoaded", function documentDOMLoaded() {
          iframe.removeEventListener("DOMContentLoaded", documentDOMLoaded, true);
          injectLoopAPI(iframe.contentWindow);
        }, true);
      };

      // Used to clear the temporary "login" state from the button.
      Services.obs.notifyObservers(null, "loop-status-changed", null);

      PanelFrame.showPopup(window, event.target, "loop", null,
                           "about:looppanel", null, callback);
    },

    /**
     * Triggers the initialization of the loop service.  Called by
     * delayedStartup.
     */
    init: function() {
      // Add observer notifications before the service is initialized
      Services.obs.addObserver(this, "loop-status-changed", false);

      MozLoopService.initialize();
      this.updateToolbarState();
    },

    uninit: function() {
      Services.obs.removeObserver(this, "loop-status-changed");
    },

    // Implements nsIObserver
    observe: function(subject, topic, data) {
      if (topic != "loop-status-changed") {
        return;
      }
      this.updateToolbarState(data);
    },

    /**
     * Updates the toolbar/menu-button state to reflect Loop status.
     *
     * @param {string} [aReason] Some states are only shown if
     *                           a related reason is provided.
     *
     *                 aReason="login": Used after a login is completed
     *                   successfully. This is used so the state can be
     *                   temporarily shown until the next state change.
     */
    updateToolbarState: function(aReason = null) {
      if (!this.toolbarButton.node) {
        return;
      }
      let state = "";
      if (MozLoopService.errors.size) {
        state = "error";
      } else if (aReason == "login" && MozLoopService.userProfile) {
        state = "active";
      } else if (MozLoopService.doNotDisturb) {
        state = "disabled";
      } else if (MozLoopService.roomsParticipantsCount > 0) {
        state = "active";
      }
      this.toolbarButton.node.setAttribute("state", state);
    },

    /**
     * Play a sound in this window IF there's no sound playing yet.
     *
     * @param {String} name Name of the sound, like 'ringtone' or 'room-joined'
     */
    playSound: function(name) {
      if (this.ActiveSound || MozLoopService.doNotDisturb) {
        return;
      }

      this.activeSound = new window.Audio();
      this.activeSound.src = `chrome://browser/content/loop/shared/sounds/${name}.ogg`;
      this.activeSound.load();
      this.activeSound.play();

      this.activeSound.addEventListener("ended", () => this.activeSound = undefined, false);
    },
  };
})();
