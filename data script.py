import pandas as pd

from app.models import *
# create Movies table

df_movies = pd.read_csv('movies.csv')
for index, row in df_movies.iterrows():
    obj = Movies()
    obj.movieId = row['movieId']
    obj.title = row['title']
    obj.genres = row['genres']
    obj.save()


# create Ratings table

df_ratings = pd.read_csv('ratings.csv')
for index, row in df_ratings.iterrows():
    obj = Ratings()
    obj.userId= row['userId']
    obj.movieId = row['movieId']
    obj.rating = row['rating']
    obj.timestamp = row['timestamp']
    obj.save()


# create Links table

df_links = pd.read_csv('links.csv')
for index, row in df_links.iterrows():
    obj = Links()
    obj.movieId = row['movieId']
    obj.imdbId = row['imdbId']
    obj.tmdbId = row['tmdbId']
    obj.save()


# create Tags table

df_tags = pd.read_csv('links.csv')
for index, row in df_tags.iterrows():
    obj = Tags()
    obj.movieId = row['movieId']
    obj.userId = row['userId']
    obj.tag = row['tag']
    obj.timestamp = row['timestamp']
    obj.save()


# create Genome_Scores table

df_genome_scores = pd.read_csv('genome_scores.csv')
for index, row in df_genome_scores.iterrows():
    obj = Genome_Scores()
    obj.movieId = row['movieId']
    obj.tagId = row['tagId']
    obj.relevance = row['relevance']
    obj.save()

# create Genome_Tags table

df_genome_tags = pd.read_csv('genome_tags.csv')
for index, row in df_genome_tags.iterrows():
    obj = Genome_Tags()
    obj.tagId = row['tagId']
    obj.tag = row['tag']
    obj.save()