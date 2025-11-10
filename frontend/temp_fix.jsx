  return (
    <>
      <AlertContainer />
      <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold">Discover Virtual Assistants</h1>
        <p className="text-gray-600">Swipe through potential matches for your job</p>
      </div>

      <div className="relative">
        <div className="flex justify-center">
          <div className="w-full max-w-md">
            {currentVA && (
              <div className="card">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-bold">{currentVA.name}</h2>
                  <span className="text-sm text-gray-500">{currentVA.country}</span>
                </div>

                <div className="mb-4">
                  <span className="text-2xl font-bold text-primary-600">
                    ${currentVA.hourlyRate}/hr
                  </span>
                </div>

                <div className="mb-4">
                  <h3 className="font-semibold mb-2">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {currentVA.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-sm ${
                      currentVA.availability
                        ? 'bg-success-100 text-success-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {currentVA.availability ? 'Available' : 'Not Available'}
                  </span>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => handleVote(false)}
                    disabled={voteMutation.isPending}
                    className="flex-1 btn-danger flex items-center justify-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Skip
                  </button>
                  <button
                    onClick={() => handleVote(true)}
                    disabled={voteMutation.isPending}
                    className="flex-1 btn-success flex items-center justify-center gap-2"
                  >
                    <Heart className="w-4 h-4" />
                    Like
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-6">
          <button
            onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
            disabled={currentIndex === 0}
            className="btn-secondary flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          <span className="text-sm text-gray-500">
            {currentIndex + 1} of {recommendations.length}
          </span>

          <button
            onClick={() => setCurrentIndex(Math.min(recommendations.length - 1, currentIndex + 1))}
            disabled={currentIndex === recommendations.length - 1}
            className="btn-secondary flex items-center gap-2"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </>
  );
