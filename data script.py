import pandas as pd
import re
from datetime import datetime, timezone
from app.models import *

df_movies = pd.read_csv('movies.dat', sep = '::', engine = 'python', encoding = 'latin-1', header = None)
df_posters = pd.read_csv('posters.csv', engine = 'python', encoding = 'latin-1', header = None)

# create Genre table
# df_movies = pd.read_csv('movies.csv')
genre_set = set()
for index, row in df_movies.iterrows():
	for genre in row[2].split("|"):
		genre_set.add(genre)

print("GENRES TIME")
for genre in genre_set:
	obj = Genre()
	obj.title = genre
	obj.save()

print("MOVIES TIME")
# create Movie table
for index, row in df_movies.iterrows():
	obj = Movie()
	obj.movieId = row[0]
	match = re.search(r'\((\d{4})\)$', row[1])
	if match:
		year = match.group(1)
		title = re.sub(r'\s*\(\d{4}\)$', '', row[1])
	obj.title = title
	obj.year = year
	try:
		obj.poster = df_posters.loc[df_posters[0] == row[0], 1].iloc[0]
	except IndexError:
		obj.poster = "n/a"
	obj.save()

print("GENRES TO MOVIES TIME")
for index, row in df_movies.iterrows():
	obj = Movie.objects.get(movieId=row[0])
	for genre in row[2].split("|"):
		obj.genres.add(Genre.objects.get(title=genre))

# List of all genres
all_genres = ['Action', 'Adventure', 'Animation', 'Children', 'Comedy', 'Crime', 'Documentary', 'Drama', 'Fantasy', 'Film Noir', 'Horror', 'IMAX', 'Musical', 'Mystery', 'Romance', 'Sci-Fi', 'Thriller', 'War', 'Western']

# create Users table
print("USERS TIME")
df_users = pd.read_csv('users.csv')
df_ngr = pd.read_csv('normalized_genre_ratings.csv')
for index, row in df_users.iterrows():
	obj = Users()
	obj.userId = row['userId']
	obj.gender = row['gender']
	obj.age = row['age']
	obj.occupation = row['occupation']
	obj.zipCode = row['zip-code']
	genre_ratings = {genre: 0 for genre in all_genres}
	filtered_df = df_ngr.loc[df_ngr['userId'] == row['userId']]
	for index, genre_row in filtered_df.iterrows():
		genre = genre_row['genre']
		normalized_rating = int(genre_row['Normalized Rating'] * 100)
		genre_ratings[genre] = normalized_rating
	obj.genreRatings = "|".join(str(value) for value in genre_ratings.values())
	obj.save()

print("RATINGS TIME")
# create Rating table (note from Quinn: Had to adjust this, as for some reason it was misbehaving...?)
df_ratings = pd.read_csv('ratings.csv', dtype=str)
for row in df_ratings.values:
	obj = Rating()
	try:
		obj.userId = Users.objects.get(userId=row[0])
		obj.movie = Movie.objects.get(movieId=row[1])
	except:
		continue
	obj.rating = row[2]
	obj.timestamp = datetime.fromtimestamp(int(row[3]), timezone.utc)
	obj.save()


# close