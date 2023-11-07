class Api::V1::JobsController < ApplicationController
  def index
    render json: "Midland Orthopedic Group " * 1000
  end

  def pull_yelp_cache
    csrf_token = form_authenticity_token
    aliases = [
      'orthopedic-associates-of-riverside-riverside',
      'orthopedic-associates-of-riverside-chicago',
      'orthopedic-associates-of-riverside-la-grange',
      'orthopaedic-associates-of-riverside-riverside',
      'orthopaedic-associates-of-riverside-chicago',
      'orthopaedic-associates-of-riverside-la-grange'
    ]
    reviews = YelpCached.cached_yelp_reviews(aliases)

    render json: { reviews: reviews, csrf_token: csrf_token }
  rescue StandardError => e
    puts "Error in search_yelp_for_orthopedic: #{e.message}"
    render json: { "error": e.message }
  end

  require 'redis'
  require 'json'
  require 'uri'
  require 'net/http'

  class YelpCached
    def self.cached_yelp_reviews(aliases)
      redis = Redis.new(url: ENV['REDIS_URL'])
      cached_data = redis.get("cached_yelp_reviews_#{aliases.join('-')}")
      reviews = JSON.parse(cached_data) if cached_data

      if cached_data.present?
        return reviews
      end

      http = Net::HTTP.new("api.yelp.com", 443)
      http.use_ssl = true

      reviews = []

      aliases.each do |alias_name|
        url = URI("https://api.yelp.com/v3/businesses/#{alias_name}")
        request = Net::HTTP::Get.new(url)
        request["Accept"] = 'application/json'
        request["Authorization"] = "Bearer #{ENV['REACT_APP_YELP_API_KEY']}"

        response = http.request(request)
        body = response.read_body
        parsed_response = JSON.parse(body)

        puts "Yelp API Response for alias '#{alias_name}':"
        puts parsed_response.inspect

        if parsed_response["error"]
          puts "Error: #{parsed_response['error']['description']}"
          next
        end

        reviews << parsed_response
      end

      # Store the retrieved data in the cache
      redis.set("cached_yelp_reviews_#{aliases.join('-')}", JSON.generate(reviews))
      redis.expire("cached_yelp_reviews_#{aliases.join('-')}", 30.days.to_i)

      return reviews
    rescue StandardError => e
      puts "Error in call_yelp: #{e.message}"
      return { "error": e.message }
    end
  end
end
