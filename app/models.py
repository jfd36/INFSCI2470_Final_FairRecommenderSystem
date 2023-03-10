from django.db import models

# Create your models here.
class Movie(models.Model):
    movieId = models.CharField(max_length = 20)
    title = models.CharField(max_length=300)
    genres = models.CharField(max_length=200)

class Tags(models.Model):
    userId = models.CharField(max_length = 20)
    movieId = models.CharField(max_length = 20)
    tag = models.CharField(max_length=300)
    timestamp = models.CharField(max_length=50)

class Links(models.Model):
    movieId = models.CharField(max_length = 20)
    imdbId = models.CharField(max_length=50)
    tmdbId = models.CharField(max_length=50)

class Ratings(models.Model):
    userId = models.CharField(max_length = 20)
    movieId = models.CharField(max_length = 20)
    rating = models.CharField(max_length=50)
    timestamp = models.CharField(max_length=50)

class Genome_Scores(models.Model):
    movieId = models.CharField(max_length = 20)
    tagId = models.CharField(max_length=20)
    relevance = models.CharField(max_length=50)

class Genome_Tags(models.Model):
    tagId = models.CharField(max_length=20)
    tag = models.CharField(max_length=100)