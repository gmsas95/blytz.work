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
        </>
      </div>
    );
  }
}
