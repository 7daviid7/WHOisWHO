const API_PREFIX = '/api';

async function handleResponse<T>(res: Response): Promise<T> {
    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.error || 'Unknown error');
    }
    return data;
}

export const api = {
    // User
    getStats: (username: string) =>
        fetch(`${API_PREFIX}/stats/${username}`).then(res => handleResponse<any>(res)),

    // Friends
    searchUsers: (query: string, username: string, page: number = 1, limit: number = 10) =>
        fetch(`${API_PREFIX}/users?q=${query}&username=${username}&page=${page}&limit=${limit}`)
            .then(res => handleResponse<PaginatedResponse<any>>(res)),

    getFriends: (username: string) =>
        fetch(`${API_PREFIX}/friends?username=${username}`).then(res => handleResponse<any[]>(res)),

    getPendingRequests: (username: string) =>
        fetch(`${API_PREFIX}/friends/requests/${username}`).then(res => handleResponse<any[]>(res)),

    getMatchHistory: (username: string, page: number = 1, limit: number = 10) =>
        fetch(`${API_PREFIX}/matches?username=${username}&page=${page}&limit=${limit}`)
            .then(res => handleResponse<any>(res)),

    sendFriendRequest: (fromUsername: string, toUserId: number) =>
        fetch(`${API_PREFIX}/friends/request`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fromUsername, toUserId })
        }).then(res => handleResponse<any>(res)),

    acceptFriendRequest: (requestId: number, username: string) =>
        fetch(`${API_PREFIX}/friends/accept`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ requestId, username })
        }).then(res => handleResponse<any>(res)),

    updateProfile: (data: any) =>
        fetch(`${API_PREFIX}/users/profile`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }).then(res => handleResponse<any>(res)),
};
