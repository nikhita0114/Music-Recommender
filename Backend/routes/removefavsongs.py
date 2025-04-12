from flask import Blueprint, request, jsonify
from db import get_db

removefavsongs_bp = Blueprint('removefavsongs', __name__)

@removefavsongs_bp.route('/removefavsongs', methods=['POST'])
def removefavsongs():
    data = request.get_json()

    # Validate input
    if not data or 'user_id' not in data or 'song_id' not in data:
        return jsonify({'message': 'Missing required fields: user_id, song_id'}), 400

    user_id = data['user_id']
    song_id = data['song_id']

    try:
        db = get_db()
        cursor = db.cursor(dictionary=True)

        # SQL query to delete the favorite song
        query = "DELETE FROM fav_songs WHERE user_id = %s AND song_id = %s"
        cursor.execute(query, (user_id, song_id))
        db.commit()  # Commit the transaction

        # Check if any rows were affected
        if cursor.rowcount == 0:
            return jsonify({'message': 'No favorite song found for the specified user and song ID'}), 404

        return jsonify({'message': f'{cursor.rowcount} favorite song(s) removed successfully'}), 200

    except Exception as e:
        return jsonify({'message': 'An error occurred while removing the favorite song'}), 500

    finally:
        if cursor:
            cursor.close()
        if db:
            db.close()
