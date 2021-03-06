/* -*- Mode: C++; tab-width: 8; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
/* vim: set sw=2 ts=8 et tw=80 : */

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

#ifndef mozilla_net_HttpChannelParent_h
#define mozilla_net_HttpChannelParent_h

#include "ADivertableParentChannel.h"
#include "nsHttp.h"
#include "mozilla/net/PHttpChannelParent.h"
#include "mozilla/net/NeckoCommon.h"
#include "mozilla/net/NeckoParent.h"
#include "OfflineObserver.h"
#include "nsIObserver.h"
#include "nsIParentRedirectingChannel.h"
#include "nsIProgressEventSink.h"
#include "nsHttpChannel.h"
#include "nsIAuthPromptProvider.h"
#include "mozilla/dom/ipc/IdType.h"

class nsICacheEntry;
class nsIAssociatedContentSecurity;

namespace mozilla {

namespace dom{
class TabParent;
class PBrowserOrId;
}

namespace net {

class HttpChannelParentListener;

class HttpChannelParent : public PHttpChannelParent
                        , public nsIParentRedirectingChannel
                        , public nsIProgressEventSink
                        , public nsIInterfaceRequestor
                        , public ADivertableParentChannel
                        , public nsIAuthPromptProvider
                        , public DisconnectableParent
{
  virtual ~HttpChannelParent();

public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSIREQUESTOBSERVER
  NS_DECL_NSISTREAMLISTENER
  NS_DECL_NSIPARENTCHANNEL
  NS_DECL_NSIPARENTREDIRECTINGCHANNEL
  NS_DECL_NSIPROGRESSEVENTSINK
  NS_DECL_NSIINTERFACEREQUESTOR
  NS_DECL_NSIAUTHPROMPTPROVIDER

  HttpChannelParent(const dom::PBrowserOrId& iframeEmbedding,
                    nsILoadContext* aLoadContext,
                    PBOverrideStatus aStatus);

  bool Init(const HttpChannelCreationArgs& aOpenArgs);

  // ADivertableParentChannel functions.
  void DivertTo(nsIStreamListener *aListener) MOZ_OVERRIDE;
  nsresult SuspendForDiversion() MOZ_OVERRIDE;

  // Calls OnStartRequest for "DivertTo" listener, then notifies child channel
  // that it should divert OnDataAvailable and OnStopRequest calls to this
  // parent channel.
  void StartDiversion();

  // Handles calling OnStart/Stop if there are errors during diversion.
  // Called asynchronously from FailDiversion.
  void NotifyDiversionFailed(nsresult aErrorCode, bool aSkipResume = true);

  // Forwarded to nsHttpChannel::SetApplyConversion.
  void SetApplyConversion(bool aApplyConversion) {
    if (mChannel) {
      mChannel->SetApplyConversion(aApplyConversion);
    }
  }

protected:
  // used to connect redirected-to channel in parent with just created
  // ChildChannel.  Used during redirects.
  bool ConnectChannel(const uint32_t& channelId);

  bool DoAsyncOpen(const URIParams&           uri,
                   const OptionalURIParams&   originalUri,
                   const OptionalURIParams&   docUri,
                   const OptionalURIParams&   referrerUri,
                   const uint32_t&            referrerPolicy,
                   const OptionalURIParams&   internalRedirectUri,
                   const OptionalURIParams&   topWindowUri,
                   const uint32_t&            loadFlags,
                   const RequestHeaderTuples& requestHeaders,
                   const nsCString&           requestMethod,
                   const OptionalInputStreamParams& uploadStream,
                   const bool&                uploadStreamHasHeaders,
                   const uint16_t&            priority,
                   const uint8_t&             redirectionLimit,
                   const bool&                allowPipelining,
                   const bool&                allowSTS,
                   const uint32_t&            thirdPartyFlags,
                   const bool&                doResumeAt,
                   const uint64_t&            startPos,
                   const nsCString&           entityID,
                   const bool&                chooseApplicationCache,
                   const nsCString&           appCacheClientID,
                   const bool&                allowSpdy,
                   const OptionalFileDescriptorSet& aFds,
                   const ipc::PrincipalInfo&  aRequestingPrincipalInfo,
                   const ipc::PrincipalInfo&  aTriggeringPrincipalInfo,
                   const uint32_t&            aSecurityFlags,
                   const uint32_t&            aContentPolicyType);

  virtual bool RecvSetPriority(const uint16_t& priority) MOZ_OVERRIDE;
  virtual bool RecvSetCacheTokenCachedCharset(const nsCString& charset) MOZ_OVERRIDE;
  virtual bool RecvSuspend() MOZ_OVERRIDE;
  virtual bool RecvResume() MOZ_OVERRIDE;
  virtual bool RecvCancel(const nsresult& status) MOZ_OVERRIDE;
  virtual bool RecvRedirect2Verify(const nsresult& result,
                                   const RequestHeaderTuples& changedHeaders,
                                   const OptionalURIParams& apiRedirectUri) MOZ_OVERRIDE;
  virtual bool RecvUpdateAssociatedContentSecurity(const int32_t& broken,
                                                   const int32_t& no) MOZ_OVERRIDE;
  virtual bool RecvDocumentChannelCleanup() MOZ_OVERRIDE;
  virtual bool RecvMarkOfflineCacheEntryAsForeign() MOZ_OVERRIDE;
  virtual bool RecvDivertOnDataAvailable(const nsCString& data,
                                         const uint64_t& offset,
                                         const uint32_t& count) MOZ_OVERRIDE;
  virtual bool RecvDivertOnStopRequest(const nsresult& statusCode) MOZ_OVERRIDE;
  virtual bool RecvDivertComplete() MOZ_OVERRIDE;
  virtual void ActorDestroy(ActorDestroyReason why) MOZ_OVERRIDE;

  // Supporting function for ADivertableParentChannel.
  nsresult ResumeForDiversion();

  // Asynchronously calls NotifyDiversionFailed.
  void FailDiversion(nsresult aErrorCode, bool aSkipResume = true);

  friend class HttpChannelParentListener;
  nsRefPtr<mozilla::dom::TabParent> mTabParent;

  void OfflineDisconnect() MOZ_OVERRIDE;
  uint32_t GetAppId() MOZ_OVERRIDE;

private:
  nsRefPtr<nsHttpChannel>       mChannel;
  nsCOMPtr<nsICacheEntry>       mCacheEntry;
  nsCOMPtr<nsIAssociatedContentSecurity>  mAssociatedContentSecurity;
  bool mIPCClosed;                // PHttpChannel actor has been Closed()

  nsCOMPtr<nsIChannel> mRedirectChannel;
  nsCOMPtr<nsIAsyncVerifyRedirectCallback> mRedirectCallback;

  nsAutoPtr<class nsHttpChannel::OfflineCacheEntryAsForeignMarker> mOfflineForeignMarker;

  // state for combining OnStatus/OnProgress with OnDataAvailable
  // into one IPDL call to child.
  nsresult mStoredStatus;
  uint64_t mStoredProgress;
  uint64_t mStoredProgressMax;

  bool mSentRedirect1Begin          : 1;
  bool mSentRedirect1BeginFailed    : 1;
  bool mReceivedRedirect2Verify     : 1;

  nsRefPtr<OfflineObserver> mObserver;

  PBOverrideStatus mPBOverride;

  nsCOMPtr<nsILoadContext> mLoadContext;
  nsRefPtr<nsHttpHandler>  mHttpHandler;

  nsRefPtr<HttpChannelParentListener> mParentListener;
  // This is listener we are diverting to.
  nsCOMPtr<nsIStreamListener> mDivertListener;
  // Set to the canceled status value if the main channel was canceled.
  nsresult mStatus;
  // Once set, no OnStart/OnData/OnStop calls should be accepted; conversely, it
  // must be set when RecvDivertOnData/~DivertOnStop/~DivertComplete are
  // received from the child channel.
  bool mDivertingFromChild;

  // Set if OnStart|StopRequest was called during a diversion from the child.
  bool mDivertedOnStartRequest;

  bool mSuspendedForDiversion;

  dom::TabId mNestedFrameId;
};

} // namespace net
} // namespace mozilla

#endif // mozilla_net_HttpChannelParent_h
