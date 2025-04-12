from flask import Blueprint, request, jsonify
from db import get_db

getuserdata_bp = Blueprint('getuserdata', __name__)

# Helper function for decoding bytes
def decode_bytes(data):
    return {key: (value.decode('utf-8') if isinstance(value, bytes) else value) for key, value in data.items()}


# Route to get user data
@getuserdata_bp.route('/getuserdata', methods=['POST'])
def get_userdata():
    data = request.get_json()
    email = data.get('email')

    if not email:
        return jsonify({'message': 'Email is required'}), 400

    db = get_db()
    try:
        cursor = db.cursor(dictionary=True)

        # Verify if the email belongs to an admin
        admin_query = "SELECT * FROM users WHERE email = %s AND type = %s"
        cursor.execute(admin_query, (email, 1))
        admin_user = cursor.fetchone()

        if not admin_user:
            return jsonify({'message': 'Admin not found or invalid email'}), 404

        # Fetch all users with type = 0
        user_query = "SELECT * FROM users WHERE type = %s"
        cursor.execute(user_query, (0,))
        users = cursor.fetchall()

        if not users:
            return jsonify({'message': 'No users found'}), 404

        # Decode bytes fields
        users = [decode_bytes(user) for user in users]

        return jsonify({'message': 'User data retrieved successfully', 'users': users}), 200

    except Exception:
        return jsonify({'message': 'An error occurred while fetching user data'}), 500

    finally:
        cursor.close()
        db.close()


# Route to fetch all songs
@getuserdata_bp.route('/getAllSongs', methods=['OPTIONS', 'POST'])
def get_AllSongs():
    if request.method == 'OPTIONS':
        response = jsonify({'message': 'Preflight request handled'})
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add("Access-Control-Allow-Methods", "POST, OPTIONS")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type")
        return response, 200

    data = request.get_json()
    email = data.get('email')

    if not email:
        return jsonify({'message': 'Email is required'}), 400

    db = get_db()
    try:
        cursor = db.cursor(dictionary=True)

        # Verify if the email belongs to an admin
        admin_query = "SELECT * FROM users WHERE email = %s AND type = %s"
        cursor.execute(admin_query, (email, 1))
        admin_user = cursor.fetchone()

        if not admin_user:
            return jsonify({'message': 'Admin not found or invalid email'}), 404

        # Fetch all songs
        placeholder_image_url = "https://cdn.pixabay.com/photo/2016/05/24/22/54/icon-1413583_640.png"
        song_query = """
            SELECT id, title, artist, genre, mood, file_path, 
            COALESCE(image_data, %s) AS image_url 
            FROM songs
        """
        cursor.execute(song_query, (placeholder_image_url,))
        songs = cursor.fetchall()

        if not songs:
            return jsonify({'message': 'No songs found'}), 404

        for song in songs:
            if isinstance(song['image_url'], bytes):
                song['image_url'] = song['image_url'].decode('utf-8')

        return jsonify({'message': 'Songs data retrieved successfully', 'songs': songs}), 200

    except Exception:
        return jsonify({'message': 'An error occurred while fetching songs'}), 500

    finally:
        cursor.close()
        db.close()


# Route to delete a song by its ID
@getuserdata_bp.route('/deleteSong/<int:song_id>', methods=['DELETE'])
def delete_song(song_id):
    db = get_db()
    try:
        cursor = db.cursor()
        cursor.execute("DELETE FROM songs WHERE id = %s", (song_id,))
        db.commit()

        if cursor.rowcount == 0:
            return jsonify({'message': 'Song not found'}), 404

        return jsonify({'message': 'Song deleted successfully'}), 200

    except Exception:
        return jsonify({'message': 'An error occurred while deleting the song'}), 500

    finally:
        cursor.close()
        db.close()


# Route to edit a song's details
@getuserdata_bp.route('/editSong/<int:song_id>', methods=['PUT'])
def edit_song(song_id):
    data = request.get_json()
    title = data.get('title')
    artist = data.get('artist')
    genre = data.get('genre')
    mood = data.get('mood')

    if not all([title, artist, genre, mood]):
        return jsonify({'message': 'All fields (title, artist, genre, mood) are required'}), 400

    db = get_db()
    try:
        cursor = db.cursor()
        cursor.execute("""
            UPDATE songs 
            SET title = %s, artist = %s, genre = %s, mood = %s 
            WHERE id = %s
        """, (title, artist, genre, mood, song_id))
        db.commit()

        if cursor.rowcount == 0:
            return jsonify({'message': 'Song not found'}), 404

        return jsonify({'message': 'Song updated successfully'}), 200

    except Exception:
        return jsonify({'message': 'An error occurred while updating the song'}), 500

    finally:
        cursor.close()
        db.close()
