Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  namespace :api do
    namespace :v1 do
      resources :notes, only: [:index]


      post "/signup", to: "users#create"
      post "/login", to: "sessions#create"
      delete "/logout", to: "sessions#destroy"
      # get "/pull_google_places_cache", to: "jobs#pull_google_places_cache"
      get "/pull_yelp_cache", to: "jobs#pull_yelp_cache"

      post '/send-email', to: 'email#send_email'

    end
  end

  get "*path", to: "fallback#index", constraints: ->(req) { !req.xhr? && req.format.html? }
end