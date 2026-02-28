const ICE_SERVERS = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
    ],
};

export function createPeerConnection(onIceCandidate, onTrack) {
    const pc = new RTCPeerConnection(ICE_SERVERS);

    pc.onicecandidate = (event) => {
        if (event.candidate && onIceCandidate) {
            onIceCandidate(event.candidate);
        }
    };

    pc.ontrack = (event) => {
        if (onTrack) {
            onTrack(event.streams[0]);
        }
    };

    return pc;
}

export async function getLocalStream(video = true) {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: video ? { width: 640, height: 480, facingMode: 'user' } : false,
        });
        return stream;
    } catch (err) {
        console.error('Failed to get local stream:', err);
        return null;
    }
}

export async function createOffer(peerConnection) {
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    return offer;
}

export async function createAnswer(peerConnection, offer) {
    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    return answer;
}

export async function handleAnswer(peerConnection, answer) {
    await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
}

export async function addIceCandidate(peerConnection, candidate) {
    try {
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (err) {
        console.error('Error adding ICE candidate:', err);
    }
}

export function closePeerConnection(peerConnection) {
    if (peerConnection) {
        peerConnection.close();
    }
}
