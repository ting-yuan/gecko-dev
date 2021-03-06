/* -*- Mode: C++; tab-width: 4; indent-tabs-mode: nil; c-basic-offset: 4 -*- */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

#ifndef WEBGLSAMPLER_H_
#define WEBGLSAMPLER_H_

#include "WebGLBindableName.h"
#include "WebGLObjectModel.h"

#include "nsWrapperCache.h"

#include "mozilla/LinkedList.h"

namespace mozilla {

class WebGLSampler MOZ_FINAL
    : public nsWrapperCache
    , public WebGLBindableName<GLenum>
    , public WebGLRefCountedObject<WebGLSampler>
    , public LinkedListElement<WebGLSampler>
    , public WebGLContextBoundObject
{
    friend class WebGLContext2;

public:

    explicit WebGLSampler(WebGLContext* aContext, GLuint sampler);

    void Delete();
    WebGLContext* GetParentObject() const;

    virtual JSObject* WrapObject(JSContext* cx) MOZ_OVERRIDE;

private:

    NS_INLINE_DECL_CYCLE_COLLECTING_NATIVE_REFCOUNTING(WebGLSampler)
    NS_DECL_CYCLE_COLLECTION_SCRIPT_HOLDER_NATIVE_CLASS(WebGLSampler)

private:

    ~WebGLSampler();
};

} // namespace mozilla

#endif // !WEBGLSAMPLER_H_
