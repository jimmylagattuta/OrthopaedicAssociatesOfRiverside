class Api::V1::JobsController < ApplicationController
  def index
    render json: "Los Angeles Orthopedic Group " * 1000
  end

  def pull_google_places_cache
    csrf_token = form_authenticity_token
    reviews = GooglePlacesCached.cached_google_places_reviews
    render json: { reviews: reviews, csrf_token: csrf_token }
  end
end

class GooglePlacesCached
  require 'redis'
  require 'json'
  require 'uri'
  require 'net/http'
  def self.remove_user_by_name(users, name)
      users.reject! { |user| user['user'] && user['user']['name'] == name }
    end
    

  def self.cached_google_places_reviews
    redis = Redis.new(url: ENV['REDIS_URL'])
    cached_data = redis.get('cached_google_places_reviews')
    reviews = JSON.parse(cached_data) if cached_data
    if cached_data.present?
      # Parse the JSON data into an array of hashes
      users = JSON.parse(cached_data)

      # Call the class method to remove the user with name "Pdub .."
      remove_user_by_name(users, 'Pdub ..')
      filtered_reviews = users.select { |review| review['rating'] == 5 }

      # Convert the updated data back to a JSON string
      updated_reviews = JSON.generate(filtered_reviews)
      return updated_reviews
    end
    place_ids = [
      'EjIzNTMgRSBCdXJsaW5ndG9uIFN0ICMxMDAsIFJpdmVyc2lkZSwgSUwgNjA1NDYsIFVTQSIfGh0KFgoUChIJmXgM8To0DogR84iATk-g77ESAzEwMA',
      'ChIJmXgM8To0DogR84iATk-g77E'
    ]
    http = Net::HTTP.new("maps.googleapis.com", 443)
    http.use_ssl = true
    reviews = []
    place_ids.each do |place_id|
      encoded_place_id = URI.encode_www_form_component(place_id)
      url = URI("https://maps.googleapis.com/maps/api/place/details/json?place_id=#{encoded_place_id}&key=#{ENV['REACT_APP_GOOGLE_PLACES_API_KEY']}")
      request = Net::HTTP::Get.new(url)
      response = http.request(request)
      body = response.read_body
      parsed_response = JSON.parse(body)

      if parsed_response['status'] == 'OK'
        place_details = parsed_response['result']
        place_reviews = place_details.present? ? place_details['reviews'] || [] : []
        reviews.concat(place_reviews)
        puts "*" * 100
        puts "place_reviews"
        puts place_reviews.inspect
        puts "*" * 100
      else
        puts "Failed to retrieve place details for place ID: #{place_id}"
      end
    end

    redis.set("cached_google_places_reviews", JSON.generate(reviews))
    redis.expire("cached_google_places_reviews", 30.days.to_i)
    cached_reviews = redis.get("cached_google_places_reviews")
    reviews = JSON.parse(cached_reviews) if cached_reviews

    if cached_reviews.present?
      # Parse the JSON data into an array of hashes
      users = JSON.parse(cached_reviews)

      # Call the class method to remove the user with name "Pdub .."
      remove_user_by_name(users, 'Pdub ..')

      # Convert the updated data back to a JSON string
      updated_reviews = JSON.generate(users)

      return updated_reviews
    end

    return { reviews: "No cached reviews" }
  end
end
