const output = document.getElementById("output");

// Generating a fake server challenge for demonstration.
async function getServerChallenge() {
  const serverChallenge = Uint8Array.from('random_challenge_from_server', c => c.charCodeAt(0));
  return serverChallenge;
}

let storedCredentialId;  // To store the credential ID after registration

/* ------- Registration Flow Using WebAuthn ------- */
document.getElementById("registerButton").addEventListener("click", async () => {
  try {
    const challenge = await getServerChallenge();

    const publicKey = {
      challenge: challenge,
      rp: { name: "FIDO2 Demo" },  // Relying party (your site)
      user: {
        id: Uint8Array.from('unique-user-id', c => c.charCodeAt(0)),
        name: "user@domain.com",
        displayName: "Demo User"
      },
      pubKeyCredParams: [{
        type: "public-key",
        alg: -7  // "ES256" algorithm (COSE Algorithm Identifier)
      }],
      authenticatorSelection: { authenticatorAttachment: "cross-platform" }, // Cross-platform authenticators (like hardware security keys)
      attestation: "direct",
      timeout: 60000,
    };

    // Initiate the credential creation process
    let credential = await navigator.credentials.create({ publicKey });

    // Store the credential ID globally (or store in localStorage for the demo)
    storedCredentialId = credential.rawId;
    localStorage.setItem('credentialId', btoa(String.fromCharCode(...new Uint8Array(credential.rawId))));

    output.innerHTML += `<p>Security Key Registration Successful!</p>`;
    output.innerHTML += `<p>Credential ID stored: ${credential.id}</p>`;
    console.log("New Credential ID generated:", credential);
    
  } catch (error) {
    output.innerHTML += `<p>Registration failed: ${error.message}</p>`;
    console.error("Registration error:", error);
  }
});

/* ------- Authentication Flow Using WebAuthn ------- */
document.getElementById("loginButton").addEventListener("click", async () => {
  try {
    const challenge = await getServerChallenge();
    
    // Retrieve the stored credential ID from registration
    const credentialIdBase64 = localStorage.getItem('credentialId');
    
    if (!credentialIdBase64) {
      output.innerHTML += `<p>Error: No credential registered. Please register a security key first.</p>`;
      return;
    }
    
    // Convert base64-encoded string (mocked credential ID) back to Uint8Array
    const credentialId = Uint8Array.from(atob(credentialIdBase64), c => c.charCodeAt(0));

    const publicKey = {
      challenge: challenge,
      allowCredentials: [{ id: credentialId, type: 'public-key' }],
      timeout: 60000,
    };

    // Request user authentication using the registered security key
    const assertion = await navigator.credentials.get({ publicKey });

    output.innerHTML += `<p>Security Key Authentication Successful!</p>`;
    output.innerHTML += `<p>Authenticator Assertion: ${JSON.stringify(assertion.response)}</p>`;
    
    console.log("User authenticated using the security key!", assertion);
    
    // Normally, the assertion response is sent to the back-end for verification
  } catch (error) {
    output.innerHTML += `<p>Authentication failed: ${error.message}</p>`;
    console.error("Authentication error:", error);
  }
});
