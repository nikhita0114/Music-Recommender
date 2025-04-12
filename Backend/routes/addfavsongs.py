from flask import Blueprint, request, jsonify
from db import get_db

addfavsongs_bp = Blueprint('addfavsongs', __name__)

# Route to add a favorite song
@addfavsongs_bp.route('/addfavsongs', methods=['POST'])
def addfavsongs():
    data = request.get_json()

    # Validate input
    if not data or 'user_id' not in data or 'song_id' not in data:
        return jsonify({'message': 'Missing required fields: user_id, song_id'}), 400

    user_id = data['user_id']
    song_id = data['song_id']

    try:
        db = get_db()
        cursor = db.cursor(dictionary=True)

        # Check for duplicates
        check_query = "SELECT * FROM fav_songs WHERE user_id = %s AND song_id = %s"
        cursor.execute(check_query, (user_id, song_id))
        existing_entry = cursor.fetchone()

        if existing_entry:
            return jsonify({'message': 'Favorite song already exists'}), 409

        # Insert the favorite song
        insert_query = "INSERT INTO fav_songs (user_id, song_id) VALUES (%s, %s)"
        cursor.execute(insert_query, (user_id, song_id))
        db.commit()  # Commit the transaction

        return jsonify({'message': 'Favorite song added successfully'}), 201

    except Exception as e:
        return jsonify({'message': 'An error occurred while adding the favorite song'}), 500

    finally:
        if cursor:
            cursor.close()
        if db:
            db.close()
