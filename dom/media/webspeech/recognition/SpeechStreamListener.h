/* -*- Mode: C++; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
/* vim:set ts=2 sw=2 sts=2 et cindent: */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

#ifndef mozilla_dom_SpeechStreamListener_h
#define mozilla_dom_SpeechStreamListener_h

#include "MediaStreamGraph.h"
#include "AudioSegment.h"

namespace mozilla {

class AudioSegment;

namespace dom {

class SpeechRecognition;

class SpeechStreamListener : public MediaStreamListener
{
public:
  explicit SpeechStreamListener(SpeechRecognition* aRecognition);
  ~SpeechStreamListener();

  virtual void NotifyQueuedTrackChanges(MediaStreamGraph* aGraph, TrackID aID,
                                        StreamTime aTrackOffset,
                                        uint32_t aTrackEvents,
                                        const MediaSegment& aQueuedMedia) MOZ_OVERRIDE;

  virtual void NotifyEvent(MediaStreamGraph* aGraph,
                           MediaStreamListener::MediaStreamGraphEvent event) MOZ_OVERRIDE;

private:
  template<typename SampleFormatType>
  void ConvertAndDispatchAudioChunk(int aDuration, float aVolume, SampleFormatType* aData, TrackRate aTrackRate);
  nsRefPtr<SpeechRecognition> mRecognition;
};

} // namespace dom
} // namespace mozilla

#endif
