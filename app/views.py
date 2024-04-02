import csv, json
from .models import *
import random

from django.views.generic import TemplateView
from django.http import (
    HttpResponse,
    HttpResponseForbidden,
    HttpResponseServerError,
    JsonResponse
)
from django.db.models import Q

# Create your views here.
class index(TemplateView):
    template_name = "index.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        
        zipcodes = sorted([user.zipCode for user in Users.objects.distinct('zipCode')])
        userids = list(Users.objects.values_list('userId', flat=True).order_by('userId'))

        context['zipcodes'] = zipcodes
        context['userIds'] = userids

        return context
    
class take2(TemplateView):
    template_name = "take2.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        
        zipcodes = sorted([user.zipCode for user in Users.objects.distinct('zipCode')])
        userids = list(Users.objects.values_list('userId', flat=True).order_by('userId'))

        context['zipcodes'] = zipcodes
        context['userIds'] = userids

        return context

class example(TemplateView):
    template_name = "example.html"

def rating_to_stars(rating):
    full_star = '&#9733;'  # Full star character
    half_star = '&#189;&#9733;'  # Half star character
    empty_star = '&#9734;'  # Empty star character

    stars = full_star * int(rating)
    if rating % 1 == 0.5:
        stars += half_star
    stars += empty_star * (5 - int(rating + 0.5))  # Fill the remaining stars with empty stars
    stars += "</span>"
    stars = "<span class='text-success'>" + stars
    return stars

def cluster_csv(request):
    data = []

    with open('clustering_with_bpr_pickle_coordinates.csv', encoding='utf-8') as f:
        csvReader = csv.DictReader(f)

        for row in csvReader:
            data.append([row["x"], row["y"], row["cluster"], row["user_id"], row["is_representative"]])
        
        return HttpResponse(
            json.dumps(data),
            content_type='application/json'
        )

def fetch_user_info(request):
    userId = request.POST.get('userId')
    if userId == "":
        userId = 1
    user = Users.objects.get(userId=int(userId))
    rating_data = []
    cluster_data = [[0, 0, 0, 0, 0]]

    # If extra is 1, fetch ratings and cluster data. Otherwise, just user info.
    if request.POST.get('extra') == '1':
        print("EXTRA!")
        # Fetch the chronological list of ratings for the user
        ratings = Rating.objects.filter(userId=user).order_by('-timestamp')
        
        # Extract the rating data and store it in a list
        rating_data = [f'<b>"{rating.movie.title}"</b><br>{rating_to_stars(float(rating.rating))}' for rating in ratings]

        with open('clustering_with_bpr_pickle_coordinates.csv', encoding='utf-8') as f:
            user_found = False
            csvReader = csv.DictReader(f)
            for row in csvReader:
                if row["user_id"] == userId:
                    user_found = True
                    cluster = row["cluster"]
                    cluster_data.append([row["x"], row["y"], 1, row["user_id"], 1])

            if user_found:
                f.seek(0)  # reset file pointer to the beginning
                csvReader = csv.DictReader(f)
                for row in csvReader:
                    if row["cluster"] == cluster and row["user_id"] != userId:
                        cluster_data.append([row["x"], row["y"], 1, row["user_id"], 0])
                    else:
                        cluster_data.append([row["x"], row["y"], 0, row["user_id"], 0])
    
    data = {
        'userId': userId,
        'gender': user.gender,
        'age': user.age,
        'occupation': user.occupation,
        'zipCode': user.zipCode,
        'genreRatings': user.genreRatings,
        'ratings': rating_data,
        'cluster_data': cluster_data
    }

    return HttpResponse(
        json.dumps(data),
        content_type='application/json'
    )

def search_users(request):
    data = [[0, 0, 0, 0, 0]] # Finally found this - the colors get wonky is the first user is representative vs non-representative without this.
    age = request.POST.get("age")
    gender = request.POST.get("gender")
    location = request.POST.get("location")
    occupation = request.POST.get("occupation")
    top_genre = request.POST.get("top_genre")
    
    query = Q()
    if age:
        query &= Q(age=age)
    if gender:
        query &= Q(gender=gender)
    if location:
        query &= Q(zipCode=location)
    if occupation:
        query &= Q(occupation=occupation)
    # if top_genre:
    #     query &= Q(top_genre=top_genre)

    users = Users.objects.filter(query).values_list('userId', flat=True)

    with open('clustering_with_bpr_pickle_coordinates.csv', encoding='utf-8') as f:
        csvReader = csv.DictReader(f)

        if not age and not gender and not location and not occupation and not top_genre:
            for row in csvReader:
                data.append([row["x"], row["y"], 0, row["user_id"], 0])
        else:
            for row in csvReader:
                if int(row["user_id"]) in users:
                    data.append([row["x"], row["y"], 1, row["user_id"], 1])
                else:
                    data.append([row["x"], row["y"], 0, row["user_id"], 0])
        
        return HttpResponse(
            json.dumps(data),
            content_type='application/json'
        )

def get_movies(request):
    random_movies = Movie.objects.order_by('?')[:10]
    movies = {}
    for i, movie in enumerate(random_movies):
        movies[i] = {
            'title': movie.title,
            'year': movie.year,
            'poster': movie.poster,
        }
    return HttpResponse(
        json.dumps(movies),
        content_type='application/json'
    )

def find_nearest_neighbors(request):
    userId = request.POST.get('userId')
    n = int(request.POST.get('n', 0))
    users = {}
    target_user = None

    with open('clustering_with_bpr_pickle_coordinates.csv', encoding='utf-8') as f:
        csv_reader = csv.DictReader(f)
        for row in csv_reader:
            n_userId = row['user_id']
            x = float(row['x'])
            y = float(row['y'])
            users[n_userId] = (x, y)
            if n_userId == userId:
                target_user = (x, y)

    if not target_user:
        return JsonResponse({'error': 'User ID not found'}, status=404)

    distances = []
    for n_userId, coordinates in users.items():
        if n_userId != userId:
            distance = ((target_user[0] - coordinates[0])**2 + (target_user[1] - coordinates[1])**2)**0.5
            distances.append((n_userId, distance))

    distances.sort(key=lambda x: x[1])
    nearest_neighbors = [user_id for user_id, _ in distances[:n]] 

    return JsonResponse({'userId': userId, 'neighbors': nearest_neighbors})

def fetch_group_info(request):
    user_ids = request.POST.getlist('userIds[]')
    user_ids = [int(uid) for uid in user_ids]
    summary_counts = {
        'gender': {},
        'age': {},
        'occupation': {},
        'zipCode': {},
    }

    cumulative_genre_ratings = [0] * 19  # Initialize with 0s for 19 genres, can be removed when the genreRatings are fixed to have 19 for every user!
    num_users = len(user_ids)

    users = Users.objects.filter(userId__in=user_ids)

    for user in users:
        data = {
            'gender': user.gender,
            'age': user.age,
            'occupation': user.occupation,
            'zipCode': user.zipCode,
        }

        for attribute, value in data.items():
            if attribute == 'gender':
                value = 'female' if value == 'F' else 'male' if value == 'M' else 'other'

            summary_counts.setdefault(attribute, {})
            summary_counts[attribute][value] = summary_counts[attribute].get(value, 0) + 1

        genre_ratings = list(map(int, user.genreRatings.split('|')))
        print(genre_ratings)
        
        genre_ratings += [0] * (19 - len(genre_ratings))
        
        cumulative_genre_ratings = [sum(x) for x in zip(cumulative_genre_ratings, genre_ratings)]
    
    average_genre_ratings = [total / num_users for total in cumulative_genre_ratings]
    summary_counts['genreRatings'] = average_genre_ratings
    print(summary_counts)

    return JsonResponse({'group_info': summary_counts})



# Helper objects and functions for AJAX functionality
switch = {
    'cluster_csv': {'call': cluster_csv},
    'fetch_user_info': {'call': fetch_user_info},
    'search_users': {'call': search_users},
    'get_movies': {'call': get_movies},
    'find_nearest_neighbors': {'call': find_nearest_neighbors},
    'fetch_group_info': {'call': fetch_group_info}
}

def ajax(request):
    """Switch to correct function given POST call

    Receives the following from POST:
    call -- What function to redirect to
    """
    post_call = request.POST.get('call', '')

    # Abort if there is no valid call sent to us from Javascript
    if not post_call:
        return HttpResponseServerError()

    # Route the request to the correct handler function
    # and pass request to the functions
    try:
        # select the function from the dictionary
        selection = switch[post_call]
    # If all else fails, handle the error message
    except KeyError:
        return HttpResponseServerError()

    else:
        procedure = selection.get('call')
        validation = selection.get('validation', None)
        if validation:
            valid = validation(request)

            if not valid:
                return HttpResponseForbidden()

        # execute the function
        return procedure(request)




