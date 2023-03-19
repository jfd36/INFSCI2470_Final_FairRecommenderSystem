from django.contrib import admin

from .models import Genre, Movie, Tag, Rating, Genome_Tag, Genome_Score, Users

# Register your models here.
admin.site.register(Genre)
admin.site.register(Movie)
admin.site.register(Tag)
admin.site.register(Rating)
admin.site.register(Genome_Tag)
admin.site.register(Genome_Score)
admin.site.register(Users)