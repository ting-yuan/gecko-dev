/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

"use strict";

const Cu = Components.utils;

Cu.import("resource://gre/modules/Services.jsm");
Cu.import("resource://gre/modules/WebChannel.jsm");

const ERROR_ID_ORIGIN_REQUIRED = "WebChannel id and originOrPermission are required.";
const VALID_WEB_CHANNEL_ID = "id";
const URL_STRING = "http://example.com";
const VALID_WEB_CHANNEL_ORIGIN = Services.io.newURI(URL_STRING, null, null);
const TEST_PERMISSION_NAME = "test-webchannel-permissions";

let MockWebChannelBroker = {
  _channelMap: new Map(),
  registerChannel: function(channel) {
    if (!this._channelMap.has(channel)) {
      this._channelMap.set(channel);
    }
  },
  unregisterChannel: function (channelToRemove) {
    this._channelMap.delete(channelToRemove)
  }
};

function run_test() {
  run_next_test();
}

/**
 * Web channel tests
 */

/**
 * Test channel listening with originOrPermission being an nsIURI.
 */
add_task(function test_web_channel_listen() {
  return new Promise((resolve, reject) => {
    let channel = new WebChannel(VALID_WEB_CHANNEL_ID, VALID_WEB_CHANNEL_ORIGIN, {
      broker: MockWebChannelBroker
    });
    let delivered = 0;
    do_check_eq(channel.id, VALID_WEB_CHANNEL_ID);
    do_check_eq(channel._originOrPermission.spec, VALID_WEB_CHANNEL_ORIGIN.spec);
    do_check_eq(channel._deliverCallback, null);

    channel.listen(function(id, message, target) {
      do_check_eq(id, VALID_WEB_CHANNEL_ID);
      do_check_true(message);
      do_check_true(message.command);
      do_check_true(target.sender);
      delivered++;
      // 2 messages should be delivered
      if (delivered === 2) {
        channel.stopListening();
        do_check_eq(channel._deliverCallback, null);
        resolve();
      }
    });

    // send two messages
    channel.deliver({
      id: VALID_WEB_CHANNEL_ID,
      message: {
        command: "one"
      }
    }, { sender: true });

    channel.deliver({
      id: VALID_WEB_CHANNEL_ID,
      message: {
        command: "two"
      }
    }, { sender: true });
  });
});

/**
 * Test channel listening with originOrPermission being a permission string.
 */
add_task(function test_web_channel_listen_permission() {
  return new Promise((resolve, reject) => {
    // add a new permission
    Services.perms.add(VALID_WEB_CHANNEL_ORIGIN, TEST_PERMISSION_NAME, Services.perms.ALLOW_ACTION);
    do_register_cleanup(() => Services.perms.remove(VALID_WEB_CHANNEL_ORIGIN.spec, TEST_PERMISSION_NAME));
    let channel = new WebChannel(VALID_WEB_CHANNEL_ID, TEST_PERMISSION_NAME, {
      broker: MockWebChannelBroker
    });
    let delivered = 0;
    do_check_eq(channel.id, VALID_WEB_CHANNEL_ID);
    do_check_eq(channel._originOrPermission, TEST_PERMISSION_NAME);
    do_check_eq(channel._deliverCallback, null);

    channel.listen(function(id, message, target) {
      do_check_eq(id, VALID_WEB_CHANNEL_ID);
      do_check_true(message);
      do_check_true(message.command);
      do_check_true(target.sender);
      delivered++;
      // 2 messages should be delivered
      if (delivered === 2) {
        channel.stopListening();
        do_check_eq(channel._deliverCallback, null);
        resolve();
      }
    });

    // send two messages
    channel.deliver({
      id: VALID_WEB_CHANNEL_ID,
      message: {
        command: "one"
      }
    }, { sender: true });

    channel.deliver({
      id: VALID_WEB_CHANNEL_ID,
      message: {
        command: "two"
      }
    }, { sender: true });
  });
});


/**
 * Test constructor
 */
add_test(function test_web_channel_constructor() {
  do_check_eq(constructorTester(), ERROR_ID_ORIGIN_REQUIRED);
  do_check_eq(constructorTester(undefined), ERROR_ID_ORIGIN_REQUIRED);
  do_check_eq(constructorTester(undefined, VALID_WEB_CHANNEL_ORIGIN), ERROR_ID_ORIGIN_REQUIRED);
  do_check_eq(constructorTester(VALID_WEB_CHANNEL_ID, undefined), ERROR_ID_ORIGIN_REQUIRED);
  do_check_false(constructorTester(VALID_WEB_CHANNEL_ID, VALID_WEB_CHANNEL_ORIGIN));

  run_next_test();
});

function constructorTester(id, origin) {
  try {
    new WebChannel(id, origin);
  } catch (e) {
    return e.message;
  }
  return false;
}
