The microphone button in ChatModal.tsx (voice-to-text using the Web Speech API) is broken in a specific way: when tapped, instead of the browser showing a normal microphone permission prompt, it shows the error "This site can't ask for your permission, close any bubbles or overlays from other apps, then try again." This happens consistently and is not caused by an actual overlay app on the device (already ruled that out by closing all other apps, tabs, and extensions, and testing in a completely fresh tab).

Please investigate the actual cause in the code rather than assuming it's device-related. Specifically check:

1. Whether SpeechRecognition.start() is being called outside of a direct user gesture (a click/tap handler), since browsers require the permission request to happen synchronously within a user-initiated event, and any async code, state update, or delay before calling .start() can break that and trigger exactly this kind of permission error.

2. Whether the mic button is accidentally inside a form element or interacting with any other event handler that could be interfering with the click event before it reaches the SpeechRecognition call.

3. Whether the site is being served over HTTPS correctly, since the Web Speech API requires a secure context and will fail permission requests on insecure or misconfigured connections.

4. Whether there's any duplicate or conflicting SpeechRecognition instance being created across re-renders, which could cause the browser to see multiple competing permission requests instead of one clean one.

Fix the root cause, then test it yourself in the live preview to confirm tapping the mic button now shows a normal permission prompt and actually starts transcribing speech, rather than just telling me it should be fixed. Tell me clearly what the actual cause was.
