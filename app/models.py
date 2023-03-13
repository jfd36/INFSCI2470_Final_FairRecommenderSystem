from django.db import models

# Create your models here.
class Genre(models.Model):
    title = models.CharField(max_length=300)

    def __str__(self):
        return f"{self.title}"

class Movie(models.Model):
    movieId = models.IntegerField()
    title = models.CharField(max_length=300)
    year = models.IntegerField()
    imdbId = models.CharField(max_length=10)
    tmdbId = models.CharField(max_length=10)
    genres = models.ManyToManyField(Genre)

    def __str__(self):
        return f"{self.title} ({self.year})"

class Tag(models.Model):
    userId = models.IntegerField()
    movie = models.ForeignKey(Movie, on_delete=models.CASCADE)
    tag = models.CharField(max_length=300)
    timestamp = models.DateTimeField(max_length=50)

    def __str__(self):
        return f"User {self.userId} tagged {self.movie} as: {self.tag}"

class Rating(models.Model):
    userId = models.IntegerField()
    movie = models.ForeignKey(Movie, on_delete=models.CASCADE)
    rating = models.DecimalField(max_digits=2, decimal_places=1)
    timestamp = models.CharField(max_length=50)

    def __str__(self):
        return f"User {self.userId} rated {self.movie} as: {self.rating}"

class Genome_Score(models.Model):
    movie = models.ForeignKey(Movie, on_delete=models.CASCADE)
    tagId = models.IntegerField()
    relevance = models.CharField(max_length=50)

    def __str__(self) -> str:
        return f"Movie {self.movie} scores {self.relevance} for: {self.tagId}"

class Genome_Tag(models.Model):
    tagId = models.IntegerField()
    tag = models.CharField(max_length=100)

    def __str__(self) -> str:
        return f"tagId {self.tagId} ({self.tag})"